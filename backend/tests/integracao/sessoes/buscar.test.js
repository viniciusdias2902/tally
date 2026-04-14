import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /atividades/:atividadeId/sessoes/:id", () => {
  let accessToken;
  let atividadeId;
  let sessaoId;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = resAtiv.body.id;

    const resSessao = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });
    sessaoId = resSessao.body.id;
  });

  it("deve retornar a sessão com 200", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/${sessaoId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: sessaoId,
      atividadeId,
      duracaoSegundos: 1500,
      modo: "timer",
    });
  });

  it("deve retornar 404 para sessão inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/${uuidInexistente}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("SESSAO_NAO_ENCONTRADA");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/${sessaoId}`);

    expect(res.status).toBe(401);
  });
});
