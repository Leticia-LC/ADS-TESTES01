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

    // Mock global.fetch
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

    // Espera o fetch terminar
    await waitFor(() =>
      expect(screen.queryByText(/Carregando tarefas/i)).not.toBeInTheDocument()
    );
  });

  it("mostra loading no início", async () => {
    render(<DashboardClient />);

    // isLoading inicial é true
    expect(screen.getByText(/Carregando tarefas/i)).toBeInTheDocument();

    // Espera o fetch terminar
    await waitFor(() =>
      expect(screen.queryByText(/Carregando tarefas/i)).not.toBeInTheDocument()
    );
  });

  it("mostra erro se fetch falhar", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Erro de teste" }),
      })
    );

    render(<DashboardClient />);

    await waitFor(() =>
      expect(screen.getByText(/Erro de teste/i)).toBeInTheDocument()
    );
  });
});