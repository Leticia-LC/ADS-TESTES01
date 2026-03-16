import { render } from "@testing-library/react";

// Mock das dependências
jest.mock("@/services/auth/session.service", () => ({
  getSessionUserFromCookies: jest.fn(),
}));

jest.mock("@/components/providers/AppProviders", () => ({
  AppProviders: ({ children, initialUser }: any) => (
    <div data-testid="app-providers" data-initial-user={JSON.stringify(initialUser)}>
      {children}
    </div>
  ),
}));

const mockGetSessionUserFromCookies = require("@/services/auth/session.service").getSessionUserFromCookies;

describe("RootLayout", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with user", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(mockUser);

    const { default: RootLayout } = await import("../layout");

    const layout = await RootLayout({ children: <div>Test</div> });

    expect(layout.type).toBe("html");
    expect(layout.props.children.type).toBe("body");
    expect(mockGetSessionUserFromCookies).toHaveBeenCalled();
  });

  it("renders with null user", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);

    const { default: RootLayout } = await import("../layout");

    const layout = await RootLayout({ children: <div>Test</div> });

    expect(layout.type).toBe("html");
    expect(layout.props.children.type).toBe("body");
    expect(mockGetSessionUserFromCookies).toHaveBeenCalled();
  });
});