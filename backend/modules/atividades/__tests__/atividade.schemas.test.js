import { describe, it, expect } from "vitest";
import {
  criarAtividadeSchema,
  atualizarAtividadeSchema,
  listarAtividadesSchema,
  idAtividadeSchema,
} from "../atividade.schemas.js";

describe("criarAtividadeSchema", () => {
  const parse = (dados) => criarAtividadeSchema.body.safeParse(dados);

  it("deve aceitar dados válidos com tipoMedicao cronometrada", () => {
    expect(parse({ nome: "Estudos", tipoMedicao: "cronometrada" }).success).toBe(true);
  });

  it("deve aceitar dados válidos com tipoMedicao binaria", () => {
    expect(parse({ nome: "Meditação", tipoMedicao: "binaria" }).success).toBe(true);
  });

  it("deve rejeitar nome vazio", () => {
    expect(parse({ nome: "", tipoMedicao: "cronometrada" }).success).toBe(false);
  });

  it("deve rejeitar nome com mais de 100 caracteres", () => {
    expect(parse({ nome: "a".repeat(101), tipoMedicao: "cronometrada" }).success).toBe(false);
  });

  it("deve rejeitar tipoMedicao inválido", () => {
    expect(parse({ nome: "Estudos", tipoMedicao: "invalido" }).success).toBe(false);
  });

  it("deve rejeitar campos ausentes", () => {
    expect(parse({}).success).toBe(false);
    expect(parse({ nome: "Estudos" }).success).toBe(false);
    expect(parse({ tipoMedicao: "cronometrada" }).success).toBe(false);
  });
});

describe("atualizarAtividadeSchema", () => {
  const parse = (dados) => atualizarAtividadeSchema.body.safeParse(dados);

  it("deve aceitar nome válido", () => {
    expect(parse({ nome: "Leitura" }).success).toBe(true);
  });

  it("deve aceitar body vazio (todos os campos são opcionais)", () => {
    expect(parse({}).success).toBe(true);
  });

  it("deve rejeitar nome vazio", () => {
    expect(parse({ nome: "" }).success).toBe(false);
  });

  it("deve rejeitar nome com mais de 100 caracteres", () => {
    expect(parse({ nome: "a".repeat(101) }).success).toBe(false);
  });
});

describe("listarAtividadesSchema", () => {
  const parse = (dados) => listarAtividadesSchema.query.safeParse(dados);

  it("deve aceitar query vazia", () => {
    expect(parse({}).success).toBe(true);
  });

  it("deve aceitar incluirArquivadas como 'true'", () => {
    expect(parse({ incluirArquivadas: "true" }).success).toBe(true);
  });

  it("deve aceitar incluirArquivadas como 'false'", () => {
    expect(parse({ incluirArquivadas: "false" }).success).toBe(true);
  });

  it("deve rejeitar incluirArquivadas com valor inválido", () => {
    expect(parse({ incluirArquivadas: "sim" }).success).toBe(false);
  });
});

describe("idAtividadeSchema", () => {
  const parse = (dados) => idAtividadeSchema.params.safeParse(dados);

  it("deve aceitar UUID válido", () => {
    expect(parse({ id: "123e4567-e89b-12d3-a456-426614174000" }).success).toBe(true);
  });

  it("deve rejeitar id que não é UUID", () => {
    expect(parse({ id: "nao-e-uuid" }).success).toBe(false);
  });

  it("deve rejeitar id ausente", () => {
    expect(parse({}).success).toBe(false);
  });
});
