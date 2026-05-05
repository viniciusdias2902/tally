import { z } from "zod";

export const heatmapQuerySchema = {
  query: z.object({
    pastaId: z.uuid().optional(),
    atividadeId: z.uuid().optional(),
    desdeDias: z.coerce.number().int().min(1).max(730).optional(),
  }),
};
