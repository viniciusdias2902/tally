import { describe, it, expect, vi } from "vitest";
import { Prisma } from "../../generated/prisma/client.ts";
import { ErroApp } from "../../lib/ErroApp.js";
import { tratarErro } from "../tratarErro.js";

function criarRes() {
  const res = {
    statusCode: 200,
    corpo: undefined,
    status(codigo) {
      res.statusCode = codigo;
      return res;
    },
    json(dados) {
      res.corpo = dados;
      return res;
    },
  };
  return res;
}

describe("tratarErro", () => {
  describe("ErroApp", () => {
    it("deve retornar codigoStatus e mensagem do ErroApp", () => {
      const res = criarRes();

      tratarErro(new ErroApp("CREDENCIAIS_INVALIDAS", 401), null, res, null);

      expect(res.statusCode).toBe(401);
      expect(res.corpo).toEqual({ erro: "CREDENCIAIS_INVALIDAS" });
    });

    it("deve incluir erros detalhados quando presentes", () => {
      const res = criarRes();
      const erro = new ErroApp("VALIDACAO_FALHOU", 400);
      erro.erros = [{ campo: "body", caminho: ["email"], mensagem: "inválido" }];

      tratarErro(erro, null, res, null);

      expect(res.statusCode).toBe(400);
      expect(res.corpo.erro).toBe("VALIDACAO_FALHOU");
      expect(res.corpo.erros).toHaveLength(1);
    });
  });

  describe("Prisma - PrismaClientKnownRequestError", () => {
    function criarErroPrisma(code, meta = {}) {
      const err = new Prisma.PrismaClientKnownRequestError("", { code, meta, clientVersion: "" });
      return err;
    }

    it("deve tratar P2002 (unique constraint) como 409", () => {
      const res = criarRes();

      tratarErro(criarErroPrisma("P2002", { target: ["email"] }), null, res, null);

      expect(res.statusCode).toBe(409);
      expect(res.corpo.erro).toBe("REGISTRO_DUPLICADO");
      expect(res.corpo.campos).toEqual(["email"]);
    });

    it("deve tratar P2025 (record not found) como 404", () => {
      const res = criarRes();

      tratarErro(criarErroPrisma("P2025"), null, res, null);

      expect(res.statusCode).toBe(404);
      expect(res.corpo.erro).toBe("REGISTRO_NAO_ENCONTRADO");
    });

    it("deve tratar P2003 (foreign key constraint) como 400", () => {
      const res = criarRes();

      tratarErro(criarErroPrisma("P2003", { field_name: "usuario_id" }), null, res, null);

      expect(res.statusCode).toBe(400);
      expect(res.corpo.erro).toBe("REFERENCIA_INVALIDA");
      expect(res.corpo.campo).toBe("usuario_id");
    });

    it("deve tratar P2014 (relation violation) como 400", () => {
      const res = criarRes();

      tratarErro(criarErroPrisma("P2014"), null, res, null);

      expect(res.statusCode).toBe(400);
      expect(res.corpo.erro).toBe("VIOLACAO_RELACAO");
    });
  });

  describe("Prisma - PrismaClientValidationError", () => {
    it("deve tratar como 400", () => {
      const res = criarRes();
      const err = new Prisma.PrismaClientValidationError("", { clientVersion: "" });

      tratarErro(err, null, res, null);

      expect(res.statusCode).toBe(400);
      expect(res.corpo.erro).toBe("DADOS_INVALIDOS");
    });
  });

  describe("erro desconhecido", () => {
    it("deve retornar 500 ERRO_INTERNO", () => {
      const res = criarRes();
      vi.spyOn(console, "error").mockImplementation(() => {});

      tratarErro(new Error("algo inesperado"), null, res, null);

      expect(res.statusCode).toBe(500);
      expect(res.corpo).toEqual({ erro: "ERRO_INTERNO" });

      console.error.mockRestore();
    });
  });
});
