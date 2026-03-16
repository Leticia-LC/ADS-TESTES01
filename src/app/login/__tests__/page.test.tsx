import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";

// Mock das dependências
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/services/auth/session.service", () => ({
  getSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Import mocks after jest.mock
import { getSessionUserFromCookies } from "@/services/auth/session.service";

const mockGetSessionUserFromCookies = getSessionUserFromCookies as jest.MockedFunction<typeof getSessionUserFromCookies>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redireciona para /dashboard quando usuário está autenticado", async () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
    };

    mockGetSessionUserFromCookies.mockResolvedValue(mockUser);

    // Importar dinamicamente para garantir que o mock seja aplicado
    const { default: LoginPage } = await import("../page");

    // Renderizar o componente
    render(await LoginPage());

    expect(mockGetSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("renderiza LoginForm quando usuário não está autenticado", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);

    // Importar dinamicamente para garantir que o mock seja aplicado
    const { default: LoginPage } = await import("../page");

    // Renderizar o componente
    const { container } = render(await LoginPage());

    expect(mockGetSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();

    // Verificar se o LoginForm está sendo renderizado
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(container.querySelector("main.page-shell")).toBeInTheDocument();
  });

  it("renderiza LoginForm quando getSessionUserFromCookies retorna null", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);

    // Importar dinamicamente para garantir que o mock seja aplicado
    const { default: LoginPage } = await import("../page");

    // Renderizar o componente
    const { container } = render(await LoginPage());

    expect(mockGetSessionUserFromCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();

    // Verificar se o LoginForm está sendo renderizado
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(container.querySelector("main.page-shell")).toBeInTheDocument();
  });
});