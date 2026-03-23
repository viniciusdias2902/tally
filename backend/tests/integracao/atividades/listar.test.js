import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };
const OUTRO_USUARIO = { email: "outro@email.com", nome: "Outro", senha: "senha1234" };

describe("GET /atividades", () => {
  let accessToken;

  beforeEach(async () => {
    await limparBanco();
    const res = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = res.body.accessToken;
  });

  it("deve retornar lista vazia quando não há atividades", async () => {
    const res = await request(app)
      .get("/atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("deve retornar apenas as atividades do usuário autenticado", async () => {
    await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    const outroRes = await request(app).post("/auth/registrar").send(OUTRO_USUARIO);
    await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${outroRes.body.accessToken}`)
      .send({ nome: "Leitura", tipoMedicao: "cronometrada" });

    const res = await request(app)
      .get("/atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nome).toBe("Estudos");
  });

  it("deve excluir atividades arquivadas por padrão", async () => {
    const criarRes = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    await request(app)
      .patch(`/atividades/${criarRes.body.id}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .get("/atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("deve incluir arquivadas quando solicitado", async () => {
    const criarRes = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    await request(app)
      .patch(`/atividades/${criarRes.body.id}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .get("/atividades?incluirArquivadas=true")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].arquivada).toBe(true);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/atividades");
    expect(res.status).toBe(401);
  });
});
