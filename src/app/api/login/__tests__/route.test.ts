import "whatwg-fetch";
import { POST } from "../route";
import { AppError } from "@/utils/app-error";

// Mock das dependências
jest.mock("@/services/auth/auth.service", () => ({
  authenticateUser: jest.fn(),
  hasValidationErrors: jest.fn(),
  validateLoginPayload: jest.fn(),
}));

jest.mock("@/services/auth/session.service", () => ({
  createSessionToken: jest.fn(),
  getSessionCookieOptions: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Import mocks after jest.mock
import { authenticateUser, hasValidationErrors, validateLoginPayload } from "@/services/auth/auth.service";
import { createSessionToken, getSessionCookieOptions } from "@/services/auth/session.service";
import { NextResponse } from "next/server";

const mockAuthenticateUser = authenticateUser as jest.MockedFunction<typeof authenticateUser>;
const mockHasValidationErrors = hasValidationErrors as jest.MockedFunction<typeof hasValidationErrors>;
const mockValidateLoginPayload = validateLoginPayload as jest.MockedFunction<typeof validateLoginPayload>;
const mockCreateSessionToken = createSessionToken as jest.MockedFunction<typeof createSessionToken>;
const mockGetSessionCookieOptions = getSessionCookieOptions as jest.MockedFunction<typeof getSessionCookieOptions>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

function createRequest(body: object): Request {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/login", () => {
  const mockUser = {
    id: "aluno_demo",
    email: "aluno@authtask.dev",
    name: "Aluno Demo",
  };

  const mockToken = "mock-session-token";
  const mockCookieOptions = {
    name: "authtask_session",
    value: "",
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: false,
      maxAge: 28800,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponse.json.mockReturnValue({
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
        delete: jest.fn(),
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetSessionCookieOptions.mockReturnValue(mockCookieOptions);
  });

  it("retorna 200 com credenciais válidas", async () => {
    mockValidateLoginPayload.mockReturnValue({});
    mockHasValidationErrors.mockReturnValue(false);
    mockAuthenticateUser.mockResolvedValue(mockUser);
    mockCreateSessionToken.mockReturnValue(mockToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createRequest({
        email: "aluno@authtask.dev",
        password: "123456",
      })
    );

    expect(mockValidateLoginPayload).toHaveBeenCalledWith({
      email: "aluno@authtask.dev",
      password: "123456",
    });
    expect(mockHasValidationErrors).toHaveBeenCalledWith({});
    expect(mockAuthenticateUser).toHaveBeenCalledWith({
      email: "aluno@authtask.dev",
      password: "123456",
    });
    expect(mockCreateSessionToken).toHaveBeenCalledWith(mockUser);
    expect(mockGetSessionCookieOptions).toHaveBeenCalled();
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Login realizado com sucesso.",
        user: mockUser,
      },
      { status: 200 }
    );
  });

  it("retorna 400 quando dados incompletos", async () => {
    const validationErrors = { email: "Email é obrigatório" };
    mockValidateLoginPayload.mockReturnValue(validationErrors);
    mockHasValidationErrors.mockReturnValue(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(createRequest({ email: "" }));

    expect(mockValidateLoginPayload).toHaveBeenCalledWith({ email: "" });
    expect(mockHasValidationErrors).toHaveBeenCalledWith(validationErrors);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Dados incompletos ou inválidos.",
        errors: validationErrors,
      },
      { status: 400 }
    );
    expect(mockAuthenticateUser).not.toHaveBeenCalled();
  });

  it("retorna 401 quando credenciais inválidas", async () => {
    mockValidateLoginPayload.mockReturnValue({});
    mockHasValidationErrors.mockReturnValue(false);
    mockAuthenticateUser.mockRejectedValue(
      new AppError("INVALID_CREDENTIALS", "Credenciais inválidas. Verifique e-mail e senha.", 401)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createRequest({
        email: "wrong@test.com",
        password: "wrongpass",
      })
    );

    expect(mockAuthenticateUser).toHaveBeenCalledWith({
      email: "wrong@test.com",
      password: "wrongpass",
    });
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Credenciais inválidas. Verifique e-mail e senha.",
        code: "INVALID_CREDENTIALS",
      },
      { status: 401 }
    );
  });

  it("retorna 500 quando erro inesperado", async () => {
    mockValidateLoginPayload.mockReturnValue({});
    mockHasValidationErrors.mockReturnValue(false);
    mockAuthenticateUser.mockRejectedValue(new Error("Erro inesperado"));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await POST(
      createRequest({
        email: "aluno@authtask.dev",
        password: "123456",
      })
    );

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Erro inesperado no servidor.",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 }
    );
  });
});
