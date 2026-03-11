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
  });

  it("lança AppError quando email é inválido", async () => {
    await expect(
      authenticateUser({
        email: "errado@test.com",
        password: "123456",
      })
    ).rejects.toThrow(AppError);
  });

  it("lança AppError quando senha é inválida", async () => {
    await expect(
      authenticateUser({
        email: "aluno@authtask.dev",
        password: "errada",
      })
    ).rejects.toThrow(AppError);
  });

});

describe("sanitizeUserId", () => {

  it("normaliza e limpa o userId", () => {
    const result = sanitizeUserId("  User@123  ");

    expect(result).toBe("user_123");
  });

});