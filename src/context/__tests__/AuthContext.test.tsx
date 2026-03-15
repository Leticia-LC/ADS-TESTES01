import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

// Mock do useRouter
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock do fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

function TestComponent() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.name : "No user"}</div>
      <div data-testid="loading">{isLoading ? "Loading" : "Not loading"}</div>
      <button onClick={() => login("test@test.com", "password")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockPush.mockClear();
  });

  it("renders with initial user", () => {
    const initialUser = { id: "1", name: "Test User", email: "test@test.com" };
    render(
      <AuthProvider initialUser={initialUser}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
  });

  it("handles login success", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({ user: { id: "1", name: "Test User", email: "test@test.com" } }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    render(
      <AuthProvider initialUser={null}>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("handles login failure", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      json: async () => ({ errors: { email: "Invalid email" } }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    render(
      <AuthProvider initialUser={null}>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles logout", async () => {
    const user = userEvent.setup();
    const initialUser = { id: "1", name: "Test User", email: "test@test.com" };
    const mockResponse = { ok: true };
    mockFetch.mockResolvedValue(mockResponse);

    render(
      <AuthProvider initialUser={initialUser}>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
    });
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});