import "whatwg-fetch";
import { POST } from "../route";

// Mock da dependência
jest.mock("@/services/auth/session.service", () => ({
  getSessionCookieOptions: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Import mocks after jest.mock
import { getSessionCookieOptions } from "@/services/auth/session.service";
import { NextResponse } from "next/server";

const mockGetSessionCookieOptions = getSessionCookieOptions as jest.MockedFunction<typeof getSessionCookieOptions>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("POST /api/logout", () => {
  const mockCookieOptions = {
    name: "authtask_session",
    value: "",
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: false,
      maxAge: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponse.json.mockReturnValue({
      cookies: {
        set: jest.fn(),
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetSessionCookieOptions.mockReturnValue(mockCookieOptions);
  });

  it("retorna 200 com mensagem de sucesso e cookie expirado", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST();

    expect(mockGetSessionCookieOptions).toHaveBeenCalledWith({ maxAge: 0 });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { message: "Logout realizado com sucesso." },
      { status: 200 }
    );
  });

  it("chama getSessionCookieOptions com maxAge 0", async () => {
    await POST();

    expect(mockGetSessionCookieOptions).toHaveBeenCalledTimes(1);
    expect(mockGetSessionCookieOptions).toHaveBeenCalledWith({ maxAge: 0 });
  });
});