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
