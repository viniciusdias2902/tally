import { z } from "zod";

export const atividadeIdSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
};

export const idSessaoSchema = {
  params: z.object({
    atividadeId: z.uuid(),
    id: z.uuid(),
  }),
};

export const criarSessaoSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  body: z.object({
    categoriaId: z.uuid().nullable().optional(),
    iniciadoEm: z.iso.datetime(),
    duracaoSegundos: z.number().int().min(0),
    modo: z.enum(["timer", "pomodoro", "manual", "check_binario"]),
    ciclosPomodoro: z.number().int().min(1).nullable().optional(),
    observacoes: z.string().max(500).nullable().optional(),
  }),
};

export const listarSessoesSchema = {
  params: z.object({
    atividadeId: z.uuid(),
  }),
  query: z.object({
    categoriaId: z.uuid().optional(),
    cursor: z.uuid().optional(),
    limite: z.coerce.number().int().min(1).max(100).optional(),
  }),
};

export const atualizarSessaoSchema = {
  params: z.object({
    atividadeId: z.uuid(),
    id: z.uuid(),
  }),
  body: z.object({
    categoriaId: z.uuid().nullable().optional(),
    iniciadoEm: z.iso.datetime().optional(),
    duracaoSegundos: z.number().int().min(0).optional(),
    modo: z.enum(["timer", "pomodoro", "manual", "check_binario"]).optional(),
    ciclosPomodoro: z.number().int().min(1).nullable().optional(),
    observacoes: z.string().max(500).nullable().optional(),
  }),
};
