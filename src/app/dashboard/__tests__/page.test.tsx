import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";

// Mock das dependências
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/services/auth/session.service", () => ({
  getSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/components/dashboard/DashboardClient", () => ({
  DashboardClient: () => <div data-testid="dashboard-client">Dashboard Client</div>,
}));

jest.mock("@/components/dashboard/ServerTaskSummary", () => ({
  ServerTaskSummary: ({ userId }: { userId: string }) => (
    <div data-testid="server-task-summary" data-userid={userId}>
      Server Task Summary
    </div>
  ),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Import mocks after jest.mock
import { getSessionUserFromCookies } from "@/services/auth/session.service";

const mockGetSessionUserFromCookies = getSessionUserFromCookies as jest.MockedFunction<typeof getSessionUserFromCookies>;

describe("DashboardPage", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redireciona para /login quando getSessionUserFromCookies retorna null", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);

    // Importar dinamicamente para garantir que o mock seja aplicado
    const { default: DashboardPage } = await import("../page");

    // O componente deve lançar erro ou redirecionar, não renderizar
    await expect(async () => {
      render(await DashboardPage());
    }).rejects.toThrow();

    expect(mockGetSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("renderiza dashboard quando usuário está autenticado", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(mockUser);

    // Importar dinamicamente para garantir que o mock seja aplicado
    const { default: DashboardPage } = await import("../page");

    // Renderizar o componente
    const { container } = render(await DashboardPage());

    expect(mockGetSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();

    // Verificar se os componentes estão sendo renderizados
    expect(screen.getByText("Dashboard protegido")).toBeInTheDocument();
    expect(screen.getByText("Esta área é protegida por middleware e validação de sessão no servidor.")).toBeInTheDocument();
    expect(screen.getByTestId("server-task-summary")).toBeInTheDocument();
    expect(screen.getByTestId("server-task-summary")).toHaveAttribute("data-userid", mockUser.id);
    expect(screen.getByTestId("dashboard-client")).toBeInTheDocument();
    expect(container.querySelector("main.page-shell.stack-lg")).toBeInTheDocument();
    expect(container.querySelector("section.card")).toBeInTheDocument();
  });
});