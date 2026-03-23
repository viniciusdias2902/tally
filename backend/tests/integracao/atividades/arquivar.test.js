import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };
const OUTRO_USUARIO = { email: "outro@email.com", nome: "Outro", senha: "senha1234" };

describe("PATCH /atividades/:id/arquivar", () => {
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

  it("deve arquivar a atividade e retornar 204", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it("deve fazer a atividade desaparecer da listagem padrão após arquivar", async () => {
    await request(app)
      .patch(`/atividades/${atividadeId}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .get("/atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.body).toHaveLength(0);
  });

  it("deve retornar 404 para atividade de outro usuário", async () => {
    const outroRes = await request(app).post("/auth/registrar").send(OUTRO_USUARIO);

    const res = await request(app)
      .patch(`/atividades/${atividadeId}/arquivar`)
      .set("Authorization", `Bearer ${outroRes.body.accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 400 para id inválido", async () => {
    const res = await request(app)
      .patch("/atividades/nao-e-uuid/arquivar")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).patch(`/atividades/${atividadeId}/arquivar`);
    expect(res.status).toBe(401);
  });
});
