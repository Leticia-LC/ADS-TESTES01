import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

// Mock do AuthContext
const loginMock = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: loginMock,
    logout: jest.fn(),
    isLoading: false,
    setUser: jest.fn(),
  }),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({ get: () => null })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it("renders the form", () => {
    const { container } = render(<LoginForm />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();

    // Snapshot test justificado: O LoginForm tem UI estável com campos fixos de email/senha
    // e botão de submit. Mudanças no snapshot indicam alterações visuais não intencionais
    // que devem ser revisadas para manter consistência da experiência do usuário.
    expect(container.firstChild).toMatchSnapshot();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await user.clear(emailInput);
    await user.type(emailInput, "test@test.com");
    await user.clear(passwordInput);
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    expect(loginMock).toHaveBeenCalledWith("test@test.com", "password");
  });

  it("shows errors on login failure", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      ok: false,
      errors: { email: "Invalid email" },
      message: "Login failed",
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("chama login corretamente", async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValueOnce({ ok: true });

    render(<LoginForm />);

    await user.clear(screen.getByRole("textbox", { name: /e-mail/i }));
    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "teste@teste.com");

    await user.clear(screen.getByLabelText(/senha/i));
    await user.type(screen.getByLabelText(/senha/i), "123");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    // ✅ Verifica se login foi chamado
    expect(loginMock).toHaveBeenCalledTimes(1);
  });
});