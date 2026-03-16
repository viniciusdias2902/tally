import { describe, it, expect } from "vitest";
import { ErroApp } from "../ErroApp.js";

describe("ErroApp", () => {
  it("deve definir mensagem e codigoStatus", () => {
    const erro = new ErroApp("ALGO_DEU_ERRADO", 400);

    expect(erro.message).toBe("ALGO_DEU_ERRADO");
    expect(erro.codigoStatus).toBe(400);
  });

  it("deve ser instância de Error", () => {
    const erro = new ErroApp("ERRO", 500);

    expect(erro).toBeInstanceOf(Error);
    expect(erro).toBeInstanceOf(ErroApp);
  });

  it("deve ser capturável com try/catch", () => {
    try {
      throw new ErroApp("NAO_ENCONTRADO", 404);
    } catch (erro) {
      expect(erro.message).toBe("NAO_ENCONTRADO");
      expect(erro.codigoStatus).toBe(404);
    }
  });
});
