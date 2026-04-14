import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /atividades/:atividadeId/sessoes/duracao", () => {
  let accessToken;
  let atividadeId;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = resAtiv.body.id;
  });

  it("deve retornar 0 quando não há sessões", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/duracao`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalSegundos: 0 });
  });

  it("deve retornar a soma da duração das sessões", async () => {
    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });

    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T11:00:00Z",
        duracaoSegundos: 3000,
        modo: "timer",
      });

    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/duracao`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalSegundos: 4500 });
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`/atividades/${uuidInexistente}/sessoes/duracao`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes/duracao`);

    expect(res.status).toBe(401);
  });
});
