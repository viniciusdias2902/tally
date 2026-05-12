import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /atividades/:atividadeId/sessoes", () => {
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
      .send({ nome: "Matemática" });
    categoriaId = resCat.body.id;
  });

  it("deve retornar lista vazia quando não há sessões", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: [],
      total: 0,
      pagina: 1,
      limite: 20,
      totalPaginas: 1,
    });
  });

  it("deve listar sessões da atividade", async () => {
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
        modo: "pomodoro",
        ciclosPomodoro: 2,
      });

    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it("deve filtrar sessões por categoria", async () => {
    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoriaId,
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
      .get(`/atividades/${atividadeId}/sessoes`)
      .query({ categoriaId })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].categoriaId).toBe(categoriaId);
    expect(res.body.total).toBe(1);
  });

  it("deve respeitar o limite de resultados", async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/atividades/${atividadeId}/sessoes`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          iniciadoEm: `2026-04-0${i + 1}T10:00:00Z`,
          duracaoSegundos: 1500,
          modo: "timer",
        });
    }

    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes`)
      .query({ limite: 2 })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPaginas).toBe(2);
  });

  it("deve retornar página específica usando skip", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/atividades/${atividadeId}/sessoes`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          iniciadoEm: `2026-04-0${i + 1}T10:00:00Z`,
          duracaoSegundos: 1500,
          modo: "timer",
        });
    }

    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes`)
      .query({ limite: 2, pagina: 2 })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.pagina).toBe(2);
    expect(res.body.total).toBe(5);
    expect(res.body.totalPaginas).toBe(3);
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`/atividades/${uuidInexistente}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/sessoes`);

    expect(res.status).toBe(401);
  });
});
