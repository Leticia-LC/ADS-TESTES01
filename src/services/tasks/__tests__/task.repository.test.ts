import { firestoreTaskRepository } from "../task.repository";

// Mock do fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("task.repository", () => {
  beforeEach(() => {
    process.env.FIREBASE_PROJECT_ID = "test-project";
    process.env.FIREBASE_WEB_API_KEY = "test-key";
    mockFetch.mockClear();
  });

  it("lists tasks by user", async () => {
    const mockResponse = {
      documents: [
        {
          name: "test-task-1",
          fields: {
            id: { stringValue: "1" },
            title: { stringValue: "Task 1" },
            completed: { booleanValue: false },
            createdAt: { integerValue: "1234567890" },
          },
        },
      ],
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const tasks = await firestoreTaskRepository.listByUser("user1");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Task 1");
  });

  it("creates task for user", async () => {
    const mockResponse = {
      name: "test-task-1",
      fields: {
        id: { stringValue: "1" },
        title: { stringValue: "New Task" },
        completed: { booleanValue: false },
        createdAt: { integerValue: "1234567890" },
      },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const task = await firestoreTaskRepository.createForUser("user1", "New Task");
    expect(task.title).toBe("New Task");
  });

  it("updates task completion", async () => {
    const mockResponse = {
      name: "test-task-1",
      fields: {
        id: { stringValue: "1" },
        title: { stringValue: "Task 1" },
        completed: { booleanValue: true },
        createdAt: { integerValue: "1234567890" },
      },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const task = await firestoreTaskRepository.updateCompletion("user1", "1", true);
    expect(task.completed).toBe(true);
  });

  it("deletes task for user", async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await expect(firestoreTaskRepository.deleteForUser("user1", "1")).resolves.toBeUndefined();
  });

  it("throws error if Firebase not configured", async () => {
    delete process.env.FIREBASE_PROJECT_ID;

    await expect(firestoreTaskRepository.listByUser("user1")).rejects.toThrow("Defina FIREBASE_PROJECT_ID");
  });
});