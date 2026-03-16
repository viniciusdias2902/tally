import { z } from "zod";

export const registrarSchema = {
  body: z.object({
    email: z.email(),
    nome: z.string().min(1).max(100),
    senha: z.string().min(8).max(72),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.email(),
    senha: z.string().min(1),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};
