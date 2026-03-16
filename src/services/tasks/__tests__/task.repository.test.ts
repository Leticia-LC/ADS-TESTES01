import { firestoreTaskRepository } from "../task.repository";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("firestoreTaskRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = "test-project";
    process.env.FIREBASE_WEB_API_KEY = "test-api-key";
  });

  describe("listByUser", () => {
    it("returns empty array for 404", async () => {
      mockFetch.mockResolvedValue({ status: 404, ok: false });

      const result = await firestoreTaskRepository.listByUser("user1");
      expect(result).toEqual([]);
    });

    it("throws for non-ok response", async () => {
      mockFetch.mockResolvedValue({ status: 500, ok: false });

      await expect(firestoreTaskRepository.listByUser("user1")).rejects.toThrow();
    });

    it("returns sorted tasks", async () => {
      const mockDocuments = [
        {
          name: "projects/test/databases/(default)/documents/users/user1/tasks/task1",
          fields: {
            title: { stringValue: "Task 1" },
            completed: { booleanValue: false },
            createdAt: { integerValue: "1000" },
            updatedAt: { integerValue: "1000" },
          },
        },
        {
          name: "projects/test/databases/(default)/documents/users/user1/tasks/task2",
          fields: {
            title: { stringValue: "Task 2" },
            completed: { booleanValue: true },
            createdAt: { integerValue: "2000" },
            updatedAt: { integerValue: "2000" },
          },
        },
      ];
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ documents: mockDocuments }),
      });

      const result = await firestoreTaskRepository.listByUser("user1");
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Task 2"); // sorted by createdAt desc
      expect(result[1].title).toBe("Task 1");
    });
  });

  describe("createForUser", () => {
    it("throws for non-ok response", async () => {
      mockFetch.mockResolvedValue({ status: 500, ok: false });

      await expect(firestoreTaskRepository.createForUser("user1", "New Task")).rejects.toThrow();
    });

    it("returns created task", async () => {
      const mockDocument = {
        name: "projects/test/databases/(default)/documents/users/user1/tasks/task1",
        fields: {
          title: { stringValue: "New Task" },
          completed: { booleanValue: false },
          createdAt: { integerValue: "1000" },
          updatedAt: { integerValue: "1000" },
        },
      };
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockDocument),
      });

      const result = await firestoreTaskRepository.createForUser("user1", "New Task");
      expect(result.id).toBe("task1");
      expect(result.title).toBe("New Task");
      expect(result.completed).toBe(false);
    });
  });

  describe("updateCompletion", () => {
    it("throws for non-ok response", async () => {
      mockFetch.mockResolvedValue({ status: 500, ok: false });

      await expect(firestoreTaskRepository.updateCompletion("user1", "task1", true)).rejects.toThrow();
    });

    it("returns updated task", async () => {
      const mockDocument = {
        name: "projects/test/databases/(default)/documents/users/user1/tasks/task1",
        fields: {
          title: { stringValue: "Task 1" },
          completed: { booleanValue: true },
          createdAt: { integerValue: "1000" },
          updatedAt: { integerValue: "2000" },
        },
      };
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockDocument),
      });

      const result = await firestoreTaskRepository.updateCompletion("user1", "task1", true);
      expect(result.completed).toBe(true);
    });
  });

  describe("deleteForUser", () => {
    it("throws for non-ok response", async () => {
      mockFetch.mockResolvedValue({ status: 500, ok: false });

      await expect(firestoreTaskRepository.deleteForUser("user1", "task1")).rejects.toThrow();
    });

    it("succeeds for ok response", async () => {
      mockFetch.mockResolvedValue({ status: 200, ok: true });

      await expect(firestoreTaskRepository.deleteForUser("user1", "task1")).resolves.toBeUndefined();
    });
  });
});