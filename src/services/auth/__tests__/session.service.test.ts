import { getSessionCookieOptions, createSessionToken, verifySessionToken, getSessionUserFromCookies, requireSessionUserFromCookies } from "../session.service";

// Mock do cookies
const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: mockGet,
  }),
}));

describe("session.service", () => {
  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = "test-secret";
    mockGet.mockClear();
  });

  it("creates and verifies session token", () => {
    const user = { id: "1", name: "Test", email: "test@test.com" };
    const token = createSessionToken(user);
    const payload = verifySessionToken(token);

    expect(payload?.user).toEqual(user);
  });

  it("returns null for invalid token", () => {
    const payload = verifySessionToken("invalid");
    expect(payload).toBeNull();
  });

  it("gets session cookie options", () => {
    const options = getSessionCookieOptions();
    expect(options.name).toBe("authtask_session");
    expect(options.cookieOptions.httpOnly).toBe(true);
  });

  it("gets session user from cookies", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com" };
    const token = createSessionToken(user);
    mockGet.mockReturnValue({ value: token });

    const result = await getSessionUserFromCookies();
    expect(result).toEqual(user);
  });

  it("returns null if no token", async () => {
    mockGet.mockReturnValue(undefined);
    const result = await getSessionUserFromCookies();
    expect(result).toBeNull();
  });

  it("requires session user", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com" };
    const token = createSessionToken(user);
    mockGet.mockReturnValue({ value: token });

    const result = await requireSessionUserFromCookies();
    expect(result).toEqual(user);
  });

  it("throws error if no user", async () => {
    mockGet.mockReturnValue(undefined);
    await expect(requireSessionUserFromCookies()).rejects.toThrow("Sessão inválida ou expirada.");
  });

  it("expires token after TTL with fake timers", () => {
    jest.useFakeTimers();
    const user = { id: "1", name: "Test", email: "test@test.com" };
    const token = createSessionToken(user);

    jest.advanceTimersByTime(8 * 60 * 60 * 1000 + 1000);

    const payload = verifySessionToken(token);
    expect(payload).toBeNull();

    jest.useRealTimers();
  });
});