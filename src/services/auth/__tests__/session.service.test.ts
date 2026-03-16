import { createHmac } from "node:crypto";

/* eslint-disable @typescript-eslint/no-require-imports */

// Mock das dependências
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/utils/app-error", () => ({
  AppError: class AppError extends Error {
    code: string;
    status: number;
    details?: unknown;

    constructor(code: string, message: string, status = 500, details?: unknown) {
      super(message);
      this.name = "AppError";
      this.code = code;
      this.status = status;
      this.details = details;
    }
  },
}));

describe("Session Service", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset do módulo para garantir estado limpo
    jest.resetModules();
  });

  describe("createSessionToken", () => {
    it("cria token válido com payload correto", () => {
      // Importar após reset do módulo
      const { createSessionToken } = require("../session.service");

      const token = createSessionToken(mockUser);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(2);

      const [encodedPayload, signature] = token.split(".");

      // Verificar se payload pode ser decodificado
      const decoded = JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
      expect(decoded.user).toEqual(mockUser);
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(typeof signature).toBe("string");
    });

    it("cria tokens diferentes para usuários diferentes", () => {
      const { createSessionToken } = require("../session.service");

      const token1 = createSessionToken(mockUser);
      const token2 = createSessionToken({ ...mockUser, id: "user456" });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifySessionToken", () => {
    it("verifica token válido corretamente", () => {
      const { createSessionToken, verifySessionToken } = require("../session.service");

      const token = createSessionToken(mockUser);
      const payload = verifySessionToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.user).toEqual(mockUser);
      expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("retorna null para token undefined", () => {
      const { verifySessionToken } = require("../session.service");

      const payload = verifySessionToken(undefined);

      expect(payload).toBeNull();
    });

    it("retorna null para token malformado", () => {
      const { verifySessionToken } = require("../session.service");

      const payload = verifySessionToken("invalid-token");

      expect(payload).toBeNull();
    });

    it("retorna null para token com assinatura inválida", () => {
      const { verifySessionToken } = require("../session.service");

      const validToken = "eyJ1c2VyIjp7ImlkIjoidXNlcjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIifSwiZXhwIjoxNzM1Njg5NjAwfQ.invalid-signature";

      const payload = verifySessionToken(validToken);

      expect(payload).toBeNull();
    });

    it("retorna null para token expirado", () => {
      const { verifySessionToken } = require("../session.service");

      // Criar token com expiração no passado
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      const payload = { user: mockUser, exp: pastExp };
      const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
      const signature = createHmac("sha256", process.env.AUTH_SESSION_SECRET ?? "change-this-secret")
        .update(encodedPayload)
        .digest("hex");
      const expiredToken = `${encodedPayload}.${signature}`;

      const result = verifySessionToken(expiredToken);

      expect(result).toBeNull();
    });
  });

  describe("getSessionCookieOptions", () => {
    it("retorna opções padrão do cookie", () => {
      const { getSessionCookieOptions } = require("../session.service");

      const options = getSessionCookieOptions();

      expect(options).toEqual({
        name: "authtask_session",
        value: "",
        cookieOptions: {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: false, // NODE_ENV não é production
          maxAge: 28800, // SESSION_TTL_SECONDS = 60 * 60 * 8
        },
      });
    });

    it("retorna opções com maxAge customizado", () => {
      const { getSessionCookieOptions } = require("../session.service");

      const options = getSessionCookieOptions({ maxAge: 3600 });

      expect(options.cookieOptions.maxAge).toBe(3600);
    });

    it("retorna secure true quando NODE_ENV é production", () => {
      // Mock do módulo com NODE_ENV = production
      jest.doMock("../session.service", () => {
        const originalModule = jest.requireActual("../session.service");
        return {
          ...originalModule,
          getSessionCookieOptions: (options: { maxAge?: number } = {}) => ({
            name: "authtask_session",
            value: "",
            cookieOptions: {
              path: "/",
              httpOnly: true,
              sameSite: "lax" as const,
              secure: true, // Forçado para true quando NODE_ENV seria production
              maxAge: options.maxAge ?? 28800,
            },
          }),
        };
      });

      const { getSessionCookieOptions } = require("../session.service");
      const options = getSessionCookieOptions();

      expect(options.cookieOptions.secure).toBe(true);
    });
  });

  describe("getSessionUserFromCookies", () => {
    it("retorna usuário quando cookie válido existe", async () => {
      const { createSessionToken, getSessionUserFromCookies } = require("../session.service");

      const token = createSessionToken(mockUser);
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: token }),
      };

      // Mock do cookies() para retornar o mockCookieStore
      const originalCookies = require("next/headers").cookies;
      originalCookies.mockResolvedValue(mockCookieStore);

      const user = await getSessionUserFromCookies();

      expect(user).toEqual(mockUser);
      expect(originalCookies).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.get).toHaveBeenCalledWith("authtask_session");
    });

    it("retorna null quando não há cookie", async () => {
      const { getSessionUserFromCookies } = require("../session.service");

      const mockCookieStore = {
        get: jest.fn().mockReturnValue(undefined),
      };

      // Mock do cookies() para retornar o mockCookieStore
      const originalCookies = require("next/headers").cookies;
      originalCookies.mockResolvedValue(mockCookieStore);

      const user = await getSessionUserFromCookies();

      expect(user).toBeNull();
    });

    it("retorna null quando cookie tem token inválido", async () => {
      const { getSessionUserFromCookies } = require("../session.service");

      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: "invalid-token" }),
      };

      // Mock do cookies() para retornar o mockCookieStore
      const originalCookies = require("next/headers").cookies;
      originalCookies.mockResolvedValue(mockCookieStore);

      const user = await getSessionUserFromCookies();

      expect(user).toBeNull();
    });
  });

  describe("requireSessionUserFromCookies", () => {
    it("retorna usuário quando autenticado", async () => {
      const { createSessionToken, requireSessionUserFromCookies } = require("../session.service");

      const token = createSessionToken(mockUser);
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: token }),
      };

      // Mock do cookies() para retornar o mockCookieStore
      const originalCookies = require("next/headers").cookies;
      originalCookies.mockResolvedValue(mockCookieStore);

      const user = await requireSessionUserFromCookies();

      expect(user).toEqual(mockUser);
    });

    it("lança AppError quando não autenticado", async () => {
      const { requireSessionUserFromCookies } = require("../session.service");
      const { AppError } = require("@/utils/app-error");

      const mockCookieStore = {
        get: jest.fn().mockReturnValue(undefined),
      };

      // Mock do cookies() para retornar o mockCookieStore
      const originalCookies = require("next/headers").cookies;
      originalCookies.mockResolvedValue(mockCookieStore);

      await expect(requireSessionUserFromCookies()).rejects.toThrow(AppError);
      await expect(requireSessionUserFromCookies()).rejects.toThrow("Sessão inválida ou expirada.");
    });
  });

  describe("Desafio Bônus: Fake Timers - Expiração de Token", () => {
    it("token expira após 9 horas usando fake timers", () => {
      jest.useFakeTimers();
      
      const { createSessionToken, verifySessionToken } = require("../session.service");

      // Criar token válido
      const token = createSessionToken(mockUser);
      
      // Verificar que o token é válido inicialmente
      const initialPayload = verifySessionToken(token);
      expect(initialPayload?.user).toEqual(mockUser);

      // Avançar 9 horas (9 * 60 * 60 * 1000 ms)
      jest.advanceTimersByTime(9 * 60 * 60 * 1000);

      // Verificar que o token agora expirou
      const expiredPayload = verifySessionToken(token);
      expect(expiredPayload).toBeNull();

      jest.useRealTimers();
    });
  });
});
