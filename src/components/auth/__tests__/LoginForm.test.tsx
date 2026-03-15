import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";
import { AuthProvider } from "@/context/AuthContext";

// Mock do useSearchParams
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock do useAuth
const mockLogin = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockGet.mockReturnValue(null);
  });

  it("renders the form", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await user.clear(emailInput);
    await user.type(emailInput, "test@test.com");
    await user.clear(passwordInput);
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password");
  });

  it("shows errors on login failure", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
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
});