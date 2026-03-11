import { authenticateUser, sanitizeUserId } from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

describe("authenticateUser", () => {

  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_DEMO_USER_ID = "aluno_demo";
    process.env.AUTH_DEMO_USER_NAME = "Aluno Demo";
  });

  it("retorna usuário quando credenciais são válidas", async () => {
    const user = await authenticateUser({
      email: "aluno@authtask.dev",
      password: "123456",
    });

    expect(user).toMatchObject({
      email: "aluno@authtask.dev",
      name: "Aluno Demo",
    });

    expect(user.id).toBe("aluno_demo");
  });

  it("lança AppError 401 quando email é inválido", async () => {
    await expect(
      authenticateUser({
        email: "errado@test.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança AppError 401 quando senha é inválida", async () => {
    await expect(
      authenticateUser({
        email: "aluno@authtask.dev",
        password: "errada",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

});

describe("sanitizeUserId", () => {

  it("normaliza e limpa o userId", () => {
    const result = sanitizeUserId("  User@123  ");

    expect(result).toBe("user_123");
  });

});