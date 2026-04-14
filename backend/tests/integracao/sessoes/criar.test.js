import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /atividades/:atividadeId/sessoes", () => {
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

  it("deve criar uma sessão com categoria e retornar 201", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoriaId,
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      atividadeId,
      categoriaId,
      duracaoSegundos: 1500,
      modo: "timer",
    });
    expect(res.body).toHaveProperty("id");
  });

  it("deve criar uma sessão sem categoria", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "manual",
      });

    expect(res.status).toBe(201);
    expect(res.body.categoriaId).toBeNull();
  });

  it("deve criar uma sessão pomodoro com ciclos", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 6000,
        modo: "pomodoro",
        ciclosPomodoro: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.modo).toBe("pomodoro");
    expect(res.body.ciclosPomodoro).toBe(4);
  });

  it("deve criar uma sessão com observações", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
        observacoes: "Sessão produtiva",
      });

    expect(res.status).toBe(201);
    expect(res.body.observacoes).toBe("Sessão produtiva");
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`/atividades/${uuidInexistente}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 400 para modo inválido", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "invalido",
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 sem campos obrigatórios", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 para duração negativa", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: -1,
        modo: "timer",
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 422 para categoria arquivada", async () => {
    await request(app)
      .patch(`/atividades/${atividadeId}/categorias/${categoriaId}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoriaId,
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });

    expect(res.status).toBe(422);
    expect(res.body.erro).toBe("CATEGORIA_ARQUIVADA");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .send({
        iniciadoEm: "2026-04-08T10:00:00Z",
        duracaoSegundos: 1500,
        modo: "timer",
      });

    expect(res.status).toBe(401);
  });
});
