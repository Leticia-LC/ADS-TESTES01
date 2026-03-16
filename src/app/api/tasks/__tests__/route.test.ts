import "whatwg-fetch";
import { GET, POST } from "../route";
import { AppError } from "@/utils/app-error";

// Mock das dependências
jest.mock("@/services/auth/session.service", () => ({
  requireSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    listTasks: jest.fn(),
    createTask: jest.fn(),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Import mocks after jest.mock
import { requireSessionUserFromCookies } from "@/services/auth/session.service";
import { taskService } from "@/services/tasks/task.service";
import { NextResponse } from "next/server";

const mockRequireSessionUserFromCookies = requireSessionUserFromCookies as jest.MockedFunction<typeof requireSessionUserFromCookies>;
const mockTaskService = taskService as jest.Mocked<typeof taskService>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

function createPostRequest(body: object): Request {
  return new Request("http://localhost/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/tasks", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  const mockTasks = [
    {
      id: "task1",
      title: "Test Task 1",
      completed: false,
      createdAt: 1234567890,
      updatedAt: 1234567890,
    },
    {
      id: "task2",
      title: "Test Task 2",
      completed: true,
      createdAt: 1234567891,
      updatedAt: 1234567891,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 200 com lista de tarefas", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.listTasks.mockResolvedValue(mockTasks);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await GET();

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.listTasks).toHaveBeenCalledWith(mockUser.id);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { tasks: mockTasks },
      { status: 200 }
    );
  });

  it("retorna 401 quando usuário não autenticado", async () => {
    mockRequireSessionUserFromCookies.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await GET();

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Sessão inválida ou expirada.",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  });

  it("retorna 500 quando serviço falha", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.listTasks.mockRejectedValue(new Error("Database error"));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await GET();

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.listTasks).toHaveBeenCalledWith(mockUser.id);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Erro inesperado no servidor.",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 }
    );
  });
});

describe("POST /api/tasks", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  const mockTask = {
    id: "new-task",
    title: "New Task",
    completed: false,
    createdAt: 1234567890,
    updatedAt: 1234567890,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 201 com tarefa criada", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.createTask.mockResolvedValue(mockTask);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createPostRequest({
        title: "New Task",
      })
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "New Task",
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { task: mockTask },
      { status: 201 }
    );
  });

  it("retorna 201 com título vazio tratado como string vazia", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.createTask.mockResolvedValue(mockTask);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(createPostRequest({}));

    expect(mockTaskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "",
    });
  });

  it("retorna 401 quando usuário não autenticado", async () => {
    mockRequireSessionUserFromCookies.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createPostRequest({
        title: "New Task",
      })
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Sessão inválida ou expirada.",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  });

  it("retorna 400 quando criação da tarefa falha", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.createTask.mockRejectedValue(
      new AppError("INVALID_TASK_TITLE", "Título da tarefa é obrigatório.", 400)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createPostRequest({
        title: "",
      })
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "",
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Título da tarefa é obrigatório.",
        code: "INVALID_TASK_TITLE",
      },
      { status: 400 }
    );
  });

  it("retorna 500 quando serviço falha", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.createTask.mockRejectedValue(new Error("Database error"));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createPostRequest({
        title: "New Task",
      })
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.createTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      title: "New Task",
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Erro inesperado no servidor.",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 }
    );
  });
});