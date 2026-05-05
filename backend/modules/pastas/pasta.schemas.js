import { z } from "zod";

export const criarPastaSchema = {
  body: z.object({
    nome: z.string().min(1).max(100),
  }),
};

export const atualizarPastaSchema = {
  body: z.object({
    nome: z.string().min(1).max(100).optional(),
    ordem: z.number().int().min(0).optional(),
  }),
};

export const idPastaSchema = {
  params: z.object({
    id: z.uuid(),
  }),
};
