import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";
import prisma from "../../../lib/prisma.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("DELETE /atividades/:atividadeId/categorias/:id", () => {
  let accessToken;
  let atividadeId;
  let categoriaId;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = resAtiv.body.id;

    const resCat = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });
    categoriaId = resCat.body.id;
  });
});
