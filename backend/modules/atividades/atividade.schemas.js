import { z } from "zod";

const tipoMedicao = z.enum(["cronometrada", "binaria"]);

export const criarAtividadeSchema = {
  body: z.object({
    nome: z.string().min(1).max(100),
    tipoMedicao,
  }),
};

export const atualizarAtividadeSchema = {
  body: z.object({
    nome: z.string().min(1).max(100).optional(),
  }),
};

export const listarAtividadesSchema = {
  query: z.object({
    incluirArquivadas: z.enum(["true", "false"]).optional(),
  }),
};

export const idAtividadeSchema = {
  params: z.object({
    id: z.uuid(),
  }),
};
