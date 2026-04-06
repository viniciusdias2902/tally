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

  it("deve deletar categoria sem sessões e retornar 204", async () => {
    const res = await request(app)
      .delete(`/atividades/${atividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);

    // Verifica que a categoria foi removida
    const resListar = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(resListar.body).toHaveLength(0);
  });

  it("deve retornar 409 ao tentar deletar categoria com sessões vinculadas", async () => {
    // Cria uma sessão associada à categoria diretamente no banco
    await prisma.sessao.create({
      data: {
        atividadeId,
        categoriaId,
        iniciadoEm: new Date(),
        duracaoSegundos: 3600,
        modo: "timer",
      },
    });

    const res = await request(app)
      .delete(`/atividades/${atividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("CATEGORIA_COM_SESSOES");
  });

  it("deve retornar 404 para categoria inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .delete(`/atividades/${atividadeId}/categorias/${uuidInexistente}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("CATEGORIA_NAO_ENCONTRADA");
  });
});
