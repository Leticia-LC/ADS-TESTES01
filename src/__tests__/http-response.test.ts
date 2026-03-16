jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init: { status: number }) => ({
      status: init.status,
      body: data,
    }),
  },
}));

import { toErrorResponse, badRequest } from "@/utils/http-response";
import { AppError } from "@/utils/app-error";

type MockResponse = {
  status: number;
  body: unknown;
};

describe("toErrorResponse", () => {

  it("retorna status 401 quando recebe AppError", () => {
    const error = new AppError(
      "INVALID_CREDENTIALS",
      "Credenciais inválidas",
      401
    );

    const response = toErrorResponse(error) as MockResponse;

    expect(response.status).toBe(401);
  });

  it("retorna status 500 para erro genérico", () => {
    const response = toErrorResponse(new Error("erro inesperado")) as MockResponse;

    expect(response.status).toBe(500);
  });

});

describe("badRequest", () => {

  it("lança AppError com status 400", () => {
    try {
      badRequest("Erro");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.status).toBe(400);
      expect(appError.code).toBe("BAD_REQUEST");
    }
  });

});