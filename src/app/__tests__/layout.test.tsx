// Mock das dependências
jest.mock("@/services/auth/session.service", () => ({
  getSessionUserFromCookies: jest.fn(),
}));

type AppProvidersProps = {
  children: React.ReactNode;
  initialUser: unknown;
};

jest.mock("@/components/providers/AppProviders", () => ({
  AppProviders: ({ children, initialUser }: AppProvidersProps) => (
    <div data-testid="app-providers" data-initial-user={JSON.stringify(initialUser)}>
      {children}
    </div>
  ),
}));

// Import mocks after jest.mock
import { getSessionUserFromCookies } from "@/services/auth/session.service";

const mockGetSessionUserFromCookies = getSessionUserFromCookies as jest.MockedFunction<typeof getSessionUserFromCookies>;

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