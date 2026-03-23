import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };
const OUTRO_USUARIO = { email: "outro@email.com", nome: "Outro", senha: "senha1234" };

describe("PATCH /atividades/:id", () => {
  let accessToken;
  let atividadeId;

  beforeEach(async () => {
    await limparBanco();
    const res = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = res.body.accessToken;

    const criarRes = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = criarRes.body.id;
  });

  it("deve atualizar o nome e retornar 200", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Leitura" });

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Leitura");
  });

  it("deve retornar 409 se o novo nome já existe para o usuário", async () => {
    await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Leitura", tipoMedicao: "cronometrada" });

    const res = await request(app)
      .patch(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Leitura" });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("ATIVIDADE_JA_EXISTE");
  });

  it("deve retornar 404 para atividade de outro usuário", async () => {
    const outroRes = await request(app).post("/auth/registrar").send(OUTRO_USUARIO);

    const res = await request(app)
      .patch(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${outroRes.body.accessToken}`)
      .send({ nome: "Leitura" });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}`)
      .send({ nome: "Leitura" });

    expect(res.status).toBe(401);
  });
});
