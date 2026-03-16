// src/context/__tests__/AuthContext.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

// Mock do useRouter do Next.js
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Componente de teste que consome o AuthContext
function TestConsumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user?.email ?? "null"}</span>
      <button onClick={() => login("a@b.com", "123456")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Componente que usa useAuth fora do Provider
function OutsideConsumer() {
  const { user } = useAuth();
  return <span>{user?.email}</span>;
}

// Componente protegido que requer AuthProvider
function ProtectedConsumer() {
  const { user } = useAuth();
  return <span>{user?.email}</span>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Provider: filhos recebem valor do contexto", () => {
    render(
      <AuthProvider initialUser={{ id: "1", email: "teste@teste.com", name: "Teste" }}>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("teste@teste.com");
  });

  it("Estado inicial: user é initialUser", () => {
    render(
      <AuthProvider
        initialUser={{ id: "2", email: "init@teste.com", name: "Init User" }}
      >
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("init@teste.com");
  });

  it("useAuth fora do Provider lança erro", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<OutsideConsumer />)).toThrow(
      "useAuth deve ser usado dentro de <AuthProvider />."
    );
    consoleError.mockRestore();
  });

  it("Mudança após login: login atualiza user", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "1", name: "Test", email: "a@b.com" } }),
    });

    render(
      <AuthProvider initialUser={null}>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("a@b.com");
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("login failure: handles network error", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(
      <AuthProvider initialUser={null}>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /login/i }));

    // User should remain null
    expect(screen.getByTestId("user-email")).toHaveTextContent("null");
  });

  it("login failure: handles server error", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(
      <AuthProvider initialUser={null}>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByTestId("user-email")).toHaveTextContent("null");
  });

  it("logout: clears user and navigates", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(
      <AuthProvider initialUser={{ id: "1", email: "test@test.com", name: "Test" }}>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("null");
    });
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("Proteção: componente que usa useAuth não renderiza sem Provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ProtectedConsumer />)).toThrow(
      "useAuth deve ser usado dentro de <AuthProvider />."
    );
    consoleError.mockRestore();
  });
});