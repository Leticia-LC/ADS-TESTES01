jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init: any) => ({
      status: init.status,
      body: data,
    }),
  },
}));

import { toErrorResponse, badRequest } from "@/utils/http-response";
import { AppError } from "@/utils/app-error";

describe("toErrorResponse", () => {

  it("retorna status 401 quando recebe AppError", () => {
    const error = new AppError(
      "INVALID_CREDENTIALS",
      "Credenciais inválidas",
      401
    );

    const response = toErrorResponse(error) as any;

    expect(response.status).toBe(401);
  });

  it("retorna status 500 para erro genérico", () => {
    const response = toErrorResponse(new Error("erro inesperado")) as any;

    expect(response.status).toBe(500);
  });

});

describe("badRequest", () => {

  it("lança AppError com status 400", () => {
    try {
      badRequest("Erro");
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

});