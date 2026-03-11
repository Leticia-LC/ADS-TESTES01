describe("auth validation", () => {

  it("deve retornar erro quando email estiver vazio", () => {
    const result = validateLoginPayload({ email: "", password: "123456" });

    expect(result.email).toBeDefined();
  });

  it("deve retornar erro quando senha estiver vazia", () => {
    const result = validateLoginPayload({ email: "user@test.com", password: "" });

    expect(result.password).toBeDefined();
  });

  it("deve passar quando dados forem válidos", () => {
    const result = validateLoginPayload({
      email: "user@test.com",
      password: "123456",
    });

    expect(hasValidationErrors(result)).toBe(false);
  });

});