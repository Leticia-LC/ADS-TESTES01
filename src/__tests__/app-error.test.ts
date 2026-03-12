import { AppError, isAppError } from "@/utils/app-error";

describe("AppError", () => {

  it("cria erro com code, message e status", () => {
    const error = new AppError(
      "INVALID_LOGIN",
      "Credenciais inválidas",
      401
    );

    expect(error.code).toBe("INVALID_LOGIN");
    expect(error.message).toBe("Credenciais inválidas");
    expect(error.status).toBe(401);
  });

});

describe("isAppError", () => {

  it("retorna true para AppError", () => {
    const error = new AppError("TEST", "erro", 400);

    expect(isAppError(error)).toBe(true);
  });

  it("retorna false para Error comum", () => {
    const error = new Error("erro");

    expect(isAppError(error)).toBe(false);
  });

  it("retorna false para null", () => {
    expect(isAppError(null)).toBe(false);
  });

});