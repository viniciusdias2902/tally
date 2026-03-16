import { describe, it, expect } from "vitest";
import { registrarSchema, loginSchema, refreshSchema } from "../auth.schemas.js";

describe("registrarSchema", () => {
  const parse = (dados) => registrarSchema.body.safeParse(dados);

  it("deve aceitar dados válidos", () => {
    const resultado = parse({ email: "a@b.com", nome: "Ana", senha: "12345678" });
    expect(resultado.success).toBe(true);
  });

  it("deve rejeitar email inválido", () => {
    const resultado = parse({ email: "invalido", nome: "Ana", senha: "12345678" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar nome vazio", () => {
    const resultado = parse({ email: "a@b.com", nome: "", senha: "12345678" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar nome com mais de 100 caracteres", () => {
    const resultado = parse({ email: "a@b.com", nome: "a".repeat(101), senha: "12345678" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar senha com menos de 8 caracteres", () => {
    const resultado = parse({ email: "a@b.com", nome: "Ana", senha: "1234567" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar senha com mais de 72 caracteres", () => {
    const resultado = parse({ email: "a@b.com", nome: "Ana", senha: "a".repeat(73) });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar campos ausentes", () => {
    expect(parse({}).success).toBe(false);
    expect(parse({ email: "a@b.com" }).success).toBe(false);
    expect(parse({ email: "a@b.com", nome: "Ana" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  const parse = (dados) => loginSchema.body.safeParse(dados);

  it("deve aceitar dados válidos", () => {
    const resultado = parse({ email: "a@b.com", senha: "qualquer" });
    expect(resultado.success).toBe(true);
  });

  it("deve rejeitar email inválido", () => {
    const resultado = parse({ email: "invalido", senha: "qualquer" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar senha vazia", () => {
    const resultado = parse({ email: "a@b.com", senha: "" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar campos ausentes", () => {
    expect(parse({}).success).toBe(false);
    expect(parse({ email: "a@b.com" }).success).toBe(false);
  });
});

describe("refreshSchema", () => {
  const parse = (dados) => refreshSchema.body.safeParse(dados);

  it("deve aceitar refreshToken válido", () => {
    const resultado = parse({ refreshToken: "algum-token" });
    expect(resultado.success).toBe(true);
  });

  it("deve rejeitar refreshToken vazio", () => {
    const resultado = parse({ refreshToken: "" });
    expect(resultado.success).toBe(false);
  });

  it("deve rejeitar sem refreshToken", () => {
    expect(parse({}).success).toBe(false);
  });
});
