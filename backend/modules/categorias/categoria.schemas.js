import { z } from "zod";

const corHex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hexadecimal válido (ex: #6366F1)")
  .default("#6366F1");

export const idAtividadeSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
};

export const idCategoriaSchema = {
  params: z.object({
    atividadeId: z.uuid(),
    id: z.uuid(),
  }),
};

export const criarCategoriaSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  body: z.object({
    nome: z.string().min(1).max(100),
    cor: corHex,
  }),
};

export const listarCategoriasSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  query: z.object({
    incluirArquivadas: z.enum(["true", "false"]).optional(),
  }),
};

export const atualizarCategoriaSchema = {
  params: z.object({
    atividadeId: z.uuid(),
    id: z.uuid(),
  }),
  body: z.object({
    nome: z.string().min(1).max(1000).optional(),
    cor: corHex.optional(),
    ordem: z.number().int().min(0).optional(),
  }),
};

export const reordenarCategoriasSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  body: z.object({
    ordenacoes: z.array(z.uuid()).min(),
  }),
};
