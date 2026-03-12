// src/components/dashboard/__tests__/DashboardClient.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardClient } from "../DashboardClient";

// Mock do AuthContext
const logoutMock = jest.fn();
const useAuthMock = {
  user: { id: "1", name: "Test", email: "test@test.com" },
  login: jest.fn(),
  logout: logoutMock,
  isLoading: false,
  setUser: jest.fn(),
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock,
}));

describe("DashboardClient", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // Mock padrão de fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    ) as jest.Mock;
  });

  it("renderiza cabeçalho e botão logout", async () => {
    render(<DashboardClient />);

    expect(screen.getByText(/Painel de Tarefas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/Carregando tarefas/i)).not.toBeInTheDocument()
    );
  });

  it("trata erro 500 da API usando jest.spyOn", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno" }),
    } as Response);

    render(<DashboardClient />);

    await waitFor(() =>
      expect(screen.getByText(/Erro interno/i)).toBeInTheDocument()
    );

    fetchSpy.mockRestore();
  });

  it("trata timeout na requisição usando jest.spyOn + mockImplementation", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 50))
    );

    render(<DashboardClient />);

    await waitFor(() =>
      expect(screen.getByText(/Timeout/i)).toBeInTheDocument()
    );
  });
});