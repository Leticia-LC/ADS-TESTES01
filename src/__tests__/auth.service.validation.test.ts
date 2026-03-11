import { hasValidationErrors, validateLoginPayload } from "@/services/auth/auth.service";

describe("validateLoginPayload", () => {

  it("retorna erro quando e-mail está vazio", () => {
    const result = validateLoginPayload({ email: "", password: "123456" });
    expect(result.email).toBe("E-mail é obrigatório.");
  });

  it("retorna erro quando formato de e-mail é inválido", () => {
    const result = validateLoginPayload({ email: "invalido", password: "123456" });
    expect(result.email).toBe("Formato de e-mail inválido.");
  });

  it("retorna erro quando senha está vazia", () => {
    const result = validateLoginPayload({ email: "a@b.com", password: "" });
    expect(result.password).toBe("Senha é obrigatória.");
  });

  it("retorna erro quando senha é menor que 6 caracteres", () => {
    const result = validateLoginPayload({ email: "a@b.com", password: "12345" });
    expect(result.password).toBe("Senha deve conter pelo menos 6 caracteres.");
  });

  it("retorna objeto vazio quando dados são válidos", () => {
    const result = validateLoginPayload({ email: "a@b.com", password: "123456" });
    expect(result).toEqual({});
  });

  it("remove espaços antes de validar", () => {
    const result = validateLoginPayload({
      email: "  a@b.com  ",
      password: "  123456  "
    });

    expect(result).toEqual({});
  });

});

describe("hasValidationErrors", () => {

  it("retorna false quando não há erros", () => {
    expect(hasValidationErrors({})).toBe(false);
  });

  it("retorna true quando há erros", () => {
    expect(hasValidationErrors({ email: "erro" })).toBe(true);
  });

});