import { describe, it, expect } from "vitest";
import {
  idAtividadeSchema,
  idCategoriaSchema,
  criarCategoriaSchema,
  listarCategoriasSchema,
  atualizarCategoriaSchema,
  reordenarCategoriasSchema,
} from "../categoria.schemas.js";

const UUID_VALIDO = "123e4567-e89b-12d3-a456-426614174000";
const UUID_VALIDO_2 = "987fcdeb-51a2-43e7-b8c9-123456789abc";

// ---------------------------------------------------------------------------
// idAtividadeSchema
// ---------------------------------------------------------------------------
describe("idAtividadeSchema", () => {
  const parse = (dados) => idAtividadeSchema.params.safeParse(dados);

  it("deve aceitar atividadeId UUID válido", () => {
    expect(parse({ atividadeId: UUID_VALIDO }).success).toBe(true);
  });

  it("deve rejeitar atividadeId que não é UUID", () => {
    expect(parse({ atividadeId: "nao-e-uuid" }).success).toBe(false);
  });

  it("deve rejeitar atividadeId ausente", () => {
    expect(parse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idCategoriaSchema
// ---------------------------------------------------------------------------
describe("idCategoriaSchema", () => {
  const parse = (dados) => idCategoriaSchema.params.safeParse(dados);

  it("deve aceitar atividadeId e id válidos", () => {
    expect(parse({ atividadeId: UUID_VALIDO, id: UUID_VALIDO_2 }).success).toBe(true);
  });

  it("deve rejeitar id que não é UUID", () => {
    expect(parse({ atividadeId: UUID_VALIDO, id: "invalido" }).success).toBe(false);
  });

  it("deve rejeitar atividadeId que não é UUID", () => {
    expect(parse({ atividadeId: "invalido", id: UUID_VALIDO }).success).toBe(false);
  });

  it("deve rejeitar quando ambos estão ausentes", () => {
    expect(parse({}).success).toBe(false);
  });

  it("deve rejeitar quando apenas id está presente", () => {
    expect(parse({ id: UUID_VALIDO }).success).toBe(false);
  });

  it("deve rejeitar quando apenas atividadeId está presente", () => {
    expect(parse({ atividadeId: UUID_VALIDO }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// criarCategoriaSchema
// ---------------------------------------------------------------------------
describe("criarCategoriaSchema", () => {
  describe("params", () => {
    const parse = (dados) => criarCategoriaSchema.params.safeParse(dados);

    it("deve aceitar atividadeId UUID válido", () => {
      expect(parse({ atividadeId: UUID_VALIDO }).success).toBe(true);
    });

    it("deve rejeitar atividadeId inválido", () => {
      expect(parse({ atividadeId: "abc" }).success).toBe(false);
    });
  });

  describe("body", () => {
    const parse = (dados) => criarCategoriaSchema.body.safeParse(dados);

    it("deve aceitar dados válidos com nome e cor", () => {
      const resultado = parse({ nome: "Trabalho", cor: "#FF5733" });
      expect(resultado.success).toBe(true);
    });

    it("deve aplicar cor default quando não informada", () => {
      const resultado = parse({ nome: "Estudos" });
      expect(resultado.success).toBe(true);
      expect(resultado.data.cor).toBe("#6366F1");
    });

    it("deve aceitar cor em letras minúsculas", () => {
      expect(parse({ nome: "Lazer", cor: "#aabbcc" }).success).toBe(true);
    });

    it("deve aceitar cor em letras maiúsculas", () => {
      expect(parse({ nome: "Lazer", cor: "#AABBCC" }).success).toBe(true);
    });

    it("deve rejeitar nome vazio", () => {
      expect(parse({ nome: "" }).success).toBe(false);
    });

    it("deve rejeitar nome com mais de 100 caracteres", () => {
      expect(parse({ nome: "a".repeat(101) }).success).toBe(false);
    });

    it("deve rejeitar nome ausente", () => {
      expect(parse({}).success).toBe(false);
    });

    it("deve rejeitar cor hexadecimal sem #", () => {
      expect(parse({ nome: "Saúde", cor: "FF5733" }).success).toBe(false);
    });

    it("deve rejeitar cor hexadecimal com formato curto (#FFF)", () => {
      expect(parse({ nome: "Saúde", cor: "#FFF" }).success).toBe(false);
    });

    it("deve rejeitar cor com caracteres inválidos", () => {
      expect(parse({ nome: "Saúde", cor: "#GGHHII" }).success).toBe(false);
    });

    it("deve rejeitar cor com mais de 7 caracteres", () => {
      expect(parse({ nome: "Saúde", cor: "#FF5733AA" }).success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// listarCategoriasSchema
// ---------------------------------------------------------------------------
describe("listarCategoriasSchema", () => {
  describe("params", () => {
    const parse = (dados) => listarCategoriasSchema.params.safeParse(dados);

    it("deve aceitar atividadeId UUID válido", () => {
      expect(parse({ atividadeId: UUID_VALIDO }).success).toBe(true);
    });

    it("deve rejeitar atividadeId inválido", () => {
      expect(parse({ atividadeId: "abc" }).success).toBe(false);
    });
  });

  describe("query", () => {
    const parse = (dados) => listarCategoriasSchema.query.safeParse(dados);

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

    it("deve rejeitar incluirArquivadas com booleano nativo", () => {
      expect(parse({ incluirArquivadas: true }).success).toBe(false);
    });
  });
});
