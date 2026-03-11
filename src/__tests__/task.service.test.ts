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

    expect(mockRepository.createForUser).toHaveBeenCalled();
  });

  it("deleteTask chama repository.deleteForUser", async () => {
    mockRepository.deleteForUser.mockResolvedValue();

    await service.deleteTask({
      userId: "user1",
      taskId: "task1",
    });

    expect(mockRepository.deleteForUser).toHaveBeenCalledWith("user1", "task1");
  });

  it("lança erro quando userId é vazio", async () => {
    await expect(service.listTasks("")).rejects.toThrow(AppError);
  });
});