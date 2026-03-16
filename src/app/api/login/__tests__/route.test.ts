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

const mockAuthenticateUser = require("@/services/auth/auth.service").authenticateUser;
const mockHasValidationErrors = require("@/services/auth/auth.service").hasValidationErrors;
const mockValidateLoginPayload = require("@/services/auth/auth.service").validateLoginPayload;
const mockCreateSessionToken = require("@/services/auth/session.service").createSessionToken;
const mockGetSessionCookieOptions = require("@/services/auth/session.service").getSessionCookieOptions;
const mockNextResponse = require("next/server").NextResponse;

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
      },
    });
    mockGetSessionCookieOptions.mockReturnValue(mockCookieOptions);
  });

  it("retorna 200 com credenciais válidas", async () => {
    mockValidateLoginPayload.mockReturnValue({});
    mockHasValidationErrors.mockReturnValue(false);
    mockAuthenticateUser.mockResolvedValue(mockUser);
    mockCreateSessionToken.mockReturnValue(mockToken);

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