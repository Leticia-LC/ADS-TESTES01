import { buildTaskService } from "@/services/tasks/task.service";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

const service = buildTaskService({ repository: mockRepository });

describe("getSummary", () => {

  it("retorna resumo correto", async () => {
    mockRepository.listByUser.mockResolvedValue([
      { id: "1", title: "A", completed: true },
      { id: "2", title: "B", completed: false },
    ]);

    const summary = await service.getSummary("user1");

    expect(summary.total).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.pending).toBe(1);
  });

});