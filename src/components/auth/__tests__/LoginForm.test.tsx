import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

// Mock do AuthContext
const loginMock = jest.fn();
let isLoading = false;

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: loginMock,
    logout: jest.fn(),
    isLoading,
    setUser: jest.fn(),
  }),
}));

// Mock do Next.js useSearchParams
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    isLoading = false;
  });

  it("exibe campos e botão de login", () => {
    render(<LoginForm />);

    expect(screen.getByRole("textbox", { name: /e-mail/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("exibe erro quando login falha", async () => {
    const user = userEvent.setup();

    // Mock async
    loginMock.mockImplementation(async () => {
      return { ok: false, message: "Erro ao autenticar", errors: {} };
    });

    render(<LoginForm />);

    await user.clear(screen.getByRole("textbox", { name: /e-mail/i }));
    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "teste@teste.com");

    await user.clear(screen.getByLabelText(/senha/i));
    await user.type(screen.getByLabelText(/senha/i), "123");

    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Espera o erro aparecer
    await waitFor(() =>
      expect(screen.getByText(/erro ao autenticar/i)).toBeInTheDocument()
    );
  });

  it("desabilita botão durante login", async () => {
    const user = userEvent.setup();

    // Simula login async para testar isLoading
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          isLoading = true; // ativa loading
          setTimeout(() => resolve({ ok: true }), 50);
        })
    );

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    // Espera o botão ficar desabilitado
    await waitFor(() => expect(submitButton).toBeDisabled());
  });
});