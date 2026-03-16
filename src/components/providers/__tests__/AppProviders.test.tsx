import { render, screen } from "@testing-library/react";
import { AppProviders } from "../AppProviders";

// Mock das dependências
jest.mock("@/context/AuthContext", () => ({
  AuthProvider: ({ children, initialUser }: any) => (
    <div data-testid="auth-provider" data-initial-user={JSON.stringify(initialUser)}>
      {children}
    </div>
  ),
}));

describe("AppProviders", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  it("renderiza AuthProvider com usuário inicial", () => {
    render(
      <AppProviders initialUser={mockUser}>
        <div>Test Children</div>
      </AppProviders>
    );

    const authProvider = screen.getByTestId("auth-provider");
    expect(authProvider).toBeInTheDocument();
    expect(authProvider).toHaveAttribute("data-initial-user", JSON.stringify(mockUser));

    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("renderiza AuthProvider sem usuário inicial", () => {
    render(
      <AppProviders initialUser={null}>
        <div>Test Children</div>
      </AppProviders>
    );

    const authProvider = screen.getByTestId("auth-provider");
    expect(authProvider).toBeInTheDocument();
    expect(authProvider).toHaveAttribute("data-initial-user", "null");

    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("passa children corretamente", () => {
    const testContent = "Unique test content";
    render(
      <AppProviders initialUser={null}>
        <span>{testContent}</span>
      </AppProviders>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
