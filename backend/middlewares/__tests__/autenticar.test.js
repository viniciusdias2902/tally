import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { autenticar } from "../autenticar.js";
import { ErroApp } from "../../lib/ErroApp.js";

const JWT_SECRET = "segredo-teste";

function criarReq(authorization) {
  return { headers: { authorization }, usuarioId: undefined };
}

describe("autenticar", () => {
  const next = vi.fn();

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("deve injetar req.usuarioId e chamar next com token válido", () => {
    const token = jwt.sign({ sub: "123" }, JWT_SECRET);
    const req = criarReq(`Bearer ${token}`);

    autenticar(req, null, next);

    expect(req.usuarioId).toBe("123");
    expect(next).toHaveBeenCalled();
  });

  it("deve lançar ErroApp 401 sem header Authorization", () => {
    const req = { headers: {} };

    expect(() => autenticar(req, null, next)).toThrow(ErroApp);
    expect(() => autenticar(req, null, next)).toThrow("TOKEN_NAO_FORNECIDO");
  });

  it("deve lançar ErroApp 401 com header sem prefixo Bearer", () => {
    const req = criarReq("Token abc123");

    expect(() => autenticar(req, null, next)).toThrow(ErroApp);
    expect(() => autenticar(req, null, next)).toThrow("TOKEN_NAO_FORNECIDO");
  });

  it("deve lançar ErroApp 401 com token expirado", () => {
    const token = jwt.sign({ sub: "123" }, JWT_SECRET, { expiresIn: "0s" });
    const req = criarReq(`Bearer ${token}`);

    expect(() => autenticar(req, null, next)).toThrow(ErroApp);
    expect(() => autenticar(req, null, next)).toThrow("TOKEN_INVALIDO");
  });

  it("deve lançar ErroApp 401 com token assinado com segredo errado", () => {
    const token = jwt.sign({ sub: "123" }, "outro-segredo");
    const req = criarReq(`Bearer ${token}`);

    expect(() => autenticar(req, null, next)).toThrow(ErroApp);
    expect(() => autenticar(req, null, next)).toThrow("TOKEN_INVALIDO");
  });

  it("deve lançar ErroApp 401 com token malformado", () => {
    const req = criarReq("Bearer token-invalido");

    expect(() => autenticar(req, null, next)).toThrow(ErroApp);
    expect(() => autenticar(req, null, next)).toThrow("TOKEN_INVALIDO");
  });
});
