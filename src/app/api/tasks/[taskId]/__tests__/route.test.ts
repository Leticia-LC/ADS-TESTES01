import "whatwg-fetch";
import { DELETE, PATCH } from "../route";
import { AppError } from "@/utils/app-error";

// Mock das dependências
jest.mock("@/services/auth/session.service", () => ({
  requireSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    toggleTaskCompletion: jest.fn(),
    deleteTask: jest.fn(),
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

function createPatchRequest(body: object): Request {
  return new Request("http://localhost/api/tasks/task123", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createDeleteRequest(): Request {
  return new Request("http://localhost/api/tasks/task123", {
    method: "DELETE",
  });
}

describe("PATCH /api/tasks/[taskId]", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  const mockTask = {
    id: "task123",
    title: "Test Task",
    completed: true,
    createdAt: 1234567890,
    updatedAt: 1234567891,
  };

  const mockParams = {
    params: Promise.resolve({ taskId: "task123" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 200 com tarefa atualizada", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.toggleTaskCompletion.mockResolvedValue(mockTask);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await PATCH(
      createPatchRequest({
        completed: true,
      }),
      mockParams
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task123",
      completed: true,
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { task: mockTask },
      { status: 200 }
    );
  });

  it("retorna 400 quando campo completed não é boolean", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await PATCH(
      createPatchRequest({
        completed: "true",
      }),
      mockParams
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Campo 'completed' é obrigatório.",
        code: "BAD_REQUEST",
      },
      { status: 400 }
    );
  });

  it("retorna 400 quando campo completed está ausente", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await PATCH(createPatchRequest({}), mockParams);

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Campo 'completed' é obrigatório.",
        code: "BAD_REQUEST",
      },
      { status: 400 }
    );
  });

  it("retorna 401 quando usuário não autenticado", async () => {
    mockRequireSessionUserFromCookies.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await PATCH(
      createPatchRequest({
        completed: true,
      }),
      mockParams
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

  it("retorna 500 quando serviço falha", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.toggleTaskCompletion.mockRejectedValue(new Error("Database error"));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await PATCH(
      createPatchRequest({
        completed: true,
      }),
      mockParams
    );

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task123",
      completed: true,
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

describe("DELETE /api/tasks/[taskId]", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  const mockParams = {
    params: Promise.resolve({ taskId: "task123" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 200 com mensagem de sucesso", async () => {
    mockRequireSessionUserFromCookies.mockResolvedValue(mockUser);
    mockTaskService.deleteTask.mockResolvedValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await DELETE(createDeleteRequest(), mockParams);

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.deleteTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task123",
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { message: "Tarefa removida com sucesso." },
      { status: 200 }
    );
  });

  it("retorna 401 quando usuário não autenticado", async () => {
    mockRequireSessionUserFromCookies.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Sessão inválida ou expirada.", 401)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await DELETE(createDeleteRequest(), mockParams);

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
    mockTaskService.deleteTask.mockRejectedValue(new Error("Database error"));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await DELETE(createDeleteRequest(), mockParams);

    expect(mockRequireSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockTaskService.deleteTask).toHaveBeenCalledWith({
      userId: mockUser.id,
      taskId: "task123",
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