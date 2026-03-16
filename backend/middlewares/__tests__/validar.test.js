import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validar } from "../validar.js";
import { ErroApp } from "../../lib/ErroApp.js";

function criarReq(dados = {}) {
  return { body: {}, params: {}, query: {}, ...dados };
}

describe("validar", () => {
  const next = vi.fn();

  describe("body", () => {
    const schema = {
      body: z.object({
        nome: z.string().min(1),
        idade: z.number(),
      }),
    };

    it("deve chamar next quando body é válido", () => {
      const req = criarReq({ body: { nome: "Ana", idade: 25 } });

      validar(schema)(req, null, next);

      expect(next).toHaveBeenCalled();
    });

    it("deve lançar ErroApp 400 quando body é inválido", () => {
      const req = criarReq({ body: { nome: "", idade: "abc" } });

      expect(() => validar(schema)(req, null, next)).toThrow(ErroApp);
      try {
        validar(schema)(req, null, next);
      } catch (erro) {
        expect(erro.codigoStatus).toBe(400);
        expect(erro.message).toBe("VALIDACAO_FALHOU");
        expect(erro.erros.length).toBeGreaterThanOrEqual(1);
        expect(erro.erros[0].campo).toBe("body");
      }
    });

    it("deve sobrescrever req.body com dados parseados", () => {
      const schema = { body: z.object({ nome: z.string() }) };
      const req = criarReq({ body: { nome: "Ana", campoExtra: "lixo" } });

      validar(schema)(req, null, next);

      expect(req.body).toEqual({ nome: "Ana" });
      expect(req.body).not.toHaveProperty("campoExtra");
    });
  });

  describe("params", () => {
    const schema = {
      params: z.object({
        id: z.string().uuid(),
      }),
    };

    it("deve chamar next quando params é válido", () => {
      const req = criarReq({ params: { id: "550e8400-e29b-41d4-a716-446655440000" } });

      validar(schema)(req, null, next);

      expect(next).toHaveBeenCalled();
    });

    it("deve lançar ErroApp 400 quando params é inválido", () => {
      const req = criarReq({ params: { id: "nao-uuid" } });

      expect(() => validar(schema)(req, null, next)).toThrow(ErroApp);
    });
  });

  describe("query", () => {
    const schema = {
      query: z.object({
        pagina: z.coerce.number().int().positive(),
      }),
    };

    it("deve chamar next quando query é válida", () => {
      const req = criarReq({ query: { pagina: "3" } });

      validar(schema)(req, null, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.pagina).toBe(3);
    });

    it("deve lançar ErroApp 400 quando query é inválida", () => {
      const req = criarReq({ query: { pagina: "abc" } });

      expect(() => validar(schema)(req, null, next)).toThrow(ErroApp);
    });
  });

  describe("múltiplos campos", () => {
    const schema = {
      body: z.object({ nome: z.string().min(1) }),
      params: z.object({ id: z.string().uuid() }),
      query: z.object({ ativo: z.coerce.boolean() }),
    };

    it("deve validar body, params e query ao mesmo tempo", () => {
      const req = criarReq({
        body: { nome: "Ana" },
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        query: { ativo: "true" },
      });

      validar(schema)(req, null, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.ativo).toBe(true);
    });

    it("deve acumular erros de body, params e query", () => {
      const req = criarReq({
        body: { nome: "" },
        params: { id: "invalido" },
        query: {},
      });

      try {
        validar(schema)(req, null, next);
      } catch (erro) {
        const campos = erro.erros.map((e) => e.campo);
        expect(campos).toContain("body");
        expect(campos).toContain("params");
      }
    });
  });

  describe("schema parcial", () => {
    it("deve ignorar campos sem schema definido", () => {
      const schema = { body: z.object({ nome: z.string() }) };
      const req = criarReq({ body: { nome: "Ana" }, query: { qualquer: "coisa" } });

      validar(schema)(req, null, next);

      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ qualquer: "coisa" });
    });
  });
});
