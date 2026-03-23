import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };
const OUTRO_USUARIO = { email: "outro@email.com", nome: "Outro", senha: "senha1234" };

describe("GET /atividades/:id", () => {
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

  it("deve retornar a atividade com 200", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: atividadeId, nome: "Estudos" });
  });

  it("deve retornar 404 para id inexistente", async () => {
    const res = await request(app)
      .get("/atividades/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 404 para atividade de outro usuário", async () => {
    const outroRes = await request(app).post("/auth/registrar").send(OUTRO_USUARIO);

    const res = await request(app)
      .get(`/atividades/${atividadeId}`)
      .set("Authorization", `Bearer ${outroRes.body.accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 400 para id inválido", async () => {
    const res = await request(app)
      .get("/atividades/nao-e-uuid")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get(`/atividades/${atividadeId}`);
    expect(res.status).toBe(401);
  });
});
