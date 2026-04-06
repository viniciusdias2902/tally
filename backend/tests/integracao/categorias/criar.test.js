import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /atividades/:atividadeId/categorias", () => {
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

  it("deve criar uma categoria e retornar 201", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho", cor: "#FF5733" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nome: "Trabalho",
      cor: "#FF5733",
      atividadeId,
      arquivada: false,
      ordem: 0,
    });
    expect(res.body).toHaveProperty("id");
  });

  it("deve atribuir ordem incremental ao criar múltiplas categorias", async () => {
    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Primeira" });

    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Segunda" });

    expect(res.status).toBe(201);
    expect(res.body.ordem).toBe(1);
  });

  it("deve usar a cor padrão #6366F1 quando não informada", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Sem cor" });

    expect(res.status).toBe(201);
    expect(res.body.cor).toBe("#6366F1");
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`/atividades/${uuidInexistente}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 404 para atividade arquivada", async () => {
    await request(app)
      .patch(`/atividades/${atividadeId}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });

    expect(res.status).toBe(404);
  });

  it("deve retornar 409 para nome duplicado na mesma atividade", async () => {
    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });

    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("CATEGORIA_JA_EXISTE");
  });

  it("deve retornar 400 para cor hex inválida", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho", cor: "vermelho" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 para cor hex incompleta", async () => {
    const res = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho", cor: "#FFF" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });
});
