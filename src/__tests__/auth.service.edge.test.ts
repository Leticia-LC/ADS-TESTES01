import { authenticateUser, sanitizeUserId } from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

describe("sanitizeUserId edge cases", () => {

  it("remove caracteres especiais", () => {
    const result = sanitizeUserId("User@#123");

    expect(result).toBe("user_123");
  });

  it("remove múltiplos underscores", () => {
    const result = sanitizeUserId("User@@@123");

    expect(result).toBe("user_123");
  });

});

describe("authenticateUser edge cases", () => {

  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_DEMO_USER_ID = "aluno_demo";
    process.env.AUTH_DEMO_USER_NAME = "Aluno Demo";
  });

  it("aceita email com espaços", async () => {
    const user = await authenticateUser({
      email: "  aluno@authtask.dev  ",
      password: "123456",
    });

    expect(user.email).toBe("aluno@authtask.dev");
  });

  it("lança erro quando senha errada", async () => {
    await expect(
      authenticateUser({
        email: "aluno@authtask.dev",
        password: "errada",
      })
    ).rejects.toThrow(AppError);
  });

});