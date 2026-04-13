import { z } from "zod";

export const atividadeIdSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
};

export const upsertConfigPomodoroSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  body: z.object({
    minutosFoco: z.number().int().min(1).optional(),
    minutosPausaCurta: z.number().int().min(1).optional(),
    minutosPausaLonga: z.number().int().min(1).optional(),
    ciclosAntesLonga: z.number().int().min(1).optional(),
  }),
};
