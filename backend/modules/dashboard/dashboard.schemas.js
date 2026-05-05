import { z } from "zod";

export const heatmapQuerySchema = {
  query: z.object({
    pastaId: z.uuid().optional(),
    atividadeId: z.uuid().optional(),
    desdeDias: z.coerce.number().int().min(1).max(730).optional(),
  }),
};

export const kpisQuerySchema = {
  query: z.object({
    pastaId: z.uuid().optional(),
    atividadeId: z.uuid().optional(),
  }),
};

export const distribuicaoQuerySchema = {
  query: z.object({
    pastaId: z.uuid().optional(),
    atividadeId: z.uuid().optional(),
  }),
};

export const evolucaoQuerySchema = {
  query: z.object({
    pastaId: z.uuid().optional(),
    atividadeId: z.uuid().optional(),
    dias: z.coerce.number().int().min(1).max(365).optional(),
  }),
};

export const topAtividadesQuerySchema = {
  query: z.object({
    limite: z.coerce.number().int().min(1).max(50).optional(),
  }),
};
