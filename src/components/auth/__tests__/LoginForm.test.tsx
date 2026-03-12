import { render, screen } from "@testing-library/react";
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