import { Prisma } from "../generated/prisma/client.ts";
import prisma from "../lib/prisma.js";

export async function limparBanco() {
  await prisma.$executeRaw(Prisma.sql`
    TRUNCATE TABLE sessoes, config_pomodoro, categorias, atividades, usuarios CASCADE
  `);
}
