import { render } from "@testing-library/react";
import { ServerTaskSummary } from "../ServerTaskSummary";
import { taskService } from "@/services/tasks/task.service";

// Mock the task service
jest.mock("@/services/tasks/task.service", () => ({
  taskService: {
    getSummary: jest.fn(),
  },
}));

describe("ServerTaskSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders summary when data is available", async () => {
    const mockSummary = { total: 5, completed: 3, pending: 2 };
    (taskService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

    const { findByText } = render(await ServerTaskSummary({ userId: "user1" }));

    expect(await findByText("Total")).toBeInTheDocument();
    expect(await findByText("5")).toBeInTheDocument();
    expect(await findByText("Concluídas")).toBeInTheDocument();
    expect(await findByText("3")).toBeInTheDocument();
    expect(await findByText("Pendentes")).toBeInTheDocument();
    expect(await findByText("2")).toBeInTheDocument();
  });

  it("renders error message when summary fails", async () => {
    (taskService.getSummary as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    const { findByText } = render(await ServerTaskSummary({ userId: "user1" }));

    expect(await findByText("Resumo indisponível")).toBeInTheDocument();
    expect(await findByText("Configure o Firestore para habilitar os dados no servidor.")).toBeInTheDocument();
  });
});