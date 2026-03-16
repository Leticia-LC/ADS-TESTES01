import { buildTaskService, validateTaskTitle } from "@/services/tasks/task.service";
import { AppError } from "@/utils/app-error";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

const service = buildTaskService({ repository: mockRepository });

describe("validateTaskTitle", () => {

  it("lança erro quando título é vazio", () => {
    expect(() => validateTaskTitle("")).toThrow(AppError);
    expect(() => validateTaskTitle("   ")).toThrow(AppError);
  });

  it("lança erro quando título é muito curto", () => {
    expect(() => validateTaskTitle("ab")).toThrow(AppError);
  });

  it("lança erro quando título é muito longo", () => {
    expect(() => validateTaskTitle("a".repeat(121))).toThrow(AppError);
  });

  it("retorna título válido sem espaços", () => {
    const result = validateTaskTitle("  Fazer exercícios  ");
    expect(result).toBe("Fazer exercícios");
  });

});

describe("taskService", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listTasks chama repository.listByUser", async () => {
    mockRepository.listByUser.mockResolvedValue([]);

    await service.listTasks("user1");

    expect(mockRepository.listByUser).toHaveBeenCalledWith("user1");
  });

  it("createTask chama repository.createForUser", async () => {
    mockRepository.createForUser.mockResolvedValue({
      id: "1",
      title: "Estudar",
      completed: false,
    });

    await service.createTask({
      userId: "user1",
      title: "Estudar",
    });

    expect(mockRepository.createForUser).toHaveBeenCalledWith(
      "user1",
      "Estudar"
    );
  });

  it("deleteTask chama repository.deleteForUser", async () => {
    mockRepository.deleteForUser.mockResolvedValue(undefined);

    await service.deleteTask({
      userId: "user1",
      taskId: "task1",
    });

    expect(mockRepository.deleteForUser).toHaveBeenCalledWith(
      "user1",
      "task1"
    );
  });

  it("lança erro quando userId é vazio", async () => {
    await expect(service.listTasks("")).rejects.toThrow(AppError);
  });

});

describe("Desafio Bônus: Simulação Multi-usuário", () => {
  it("operações concorrentes de dois usuários com listas isoladas", async () => {
    // Criar serviços separados para cada usuário
    const mockRepositoryUser1 = {
      listByUser: jest.fn(),
      createForUser: jest.fn(),
      updateCompletion: jest.fn(),
      deleteForUser: jest.fn(),
    };

    const mockRepositoryUser2 = {
      listByUser: jest.fn(),
      createForUser: jest.fn(),
      updateCompletion: jest.fn(),
      deleteForUser: jest.fn(),
    };

    const serviceUser1 = buildTaskService({ repository: mockRepositoryUser1 });
    const serviceUser2 = buildTaskService({ repository: mockRepositoryUser2 });

    // Configurar dados isolados para cada usuário
    const tasksUser1 = [
      { id: "task1", title: "Estudar React", completed: false, createdAt: 1000, updatedAt: 1000 },
      { id: "task2", title: "Fazer exercícios", completed: true, createdAt: 2000, updatedAt: 2000 },
    ];

    const tasksUser2 = [
      { id: "task3", title: "Ler livro", completed: false, createdAt: 1500, updatedAt: 1500 },
    ];

    mockRepositoryUser1.listByUser.mockResolvedValue(tasksUser1);
    mockRepositoryUser2.listByUser.mockResolvedValue(tasksUser2);

    // Operações concorrentes
    const [resultUser1, resultUser2] = await Promise.all([
      serviceUser1.listTasks("user1"),
      serviceUser2.listTasks("user2")
    ]);

    // Verificar isolamento
    expect(resultUser1).toHaveLength(2);
    expect(resultUser1[0].title).toBe("Estudar React");
    expect(resultUser1[1].title).toBe("Fazer exercícios");

    expect(resultUser2).toHaveLength(1);
    expect(resultUser2[0].title).toBe("Ler livro");

    // Verificar que os repositórios foram chamados corretamente
    expect(mockRepositoryUser1.listByUser).toHaveBeenCalledWith("user1");
    expect(mockRepositoryUser2.listByUser).toHaveBeenCalledWith("user2");

    // Simular criação concorrente
    mockRepositoryUser1.createForUser.mockResolvedValue({
      id: "task4", title: "Nova tarefa User1", completed: false, createdAt: 3000, updatedAt: 3000
    });
    mockRepositoryUser2.createForUser.mockResolvedValue({
      id: "task5", title: "Nova tarefa User2", completed: false, createdAt: 3000, updatedAt: 3000
    });

    await Promise.all([
      serviceUser1.createTask({ userId: "user1", title: "Nova tarefa User1" }),
      serviceUser2.createTask({ userId: "user2", title: "Nova tarefa User2" })
    ]);

    expect(mockRepositoryUser1.createForUser).toHaveBeenCalledWith("user1", "Nova tarefa User1");
    expect(mockRepositoryUser2.createForUser).toHaveBeenCalledWith("user2", "Nova tarefa User2");
  });
});