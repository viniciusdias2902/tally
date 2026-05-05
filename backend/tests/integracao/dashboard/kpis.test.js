import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /dashboard/kpis", () => {
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

  it("deve retornar zeros quando não há sessões", async () => {
    const res = await request(app)
      .get("/dashboard/kpis")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalSegundos: 0,
      totalSessoes: 0,
      streakAtual: 0,
      melhorStreak: 0,
    });
  });

  it("deve somar totais de sessões registradas", async () => {
    const agora = new Date();
    agora.setUTCHours(12, 0, 0, 0);

    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: agora.toISOString(),
        duracaoSegundos: 1800,
        modo: "timer",
      });
    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: agora.toISOString(),
        duracaoSegundos: 1200,
        modo: "timer",
      });

    const res = await request(app)
      .get("/dashboard/kpis")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalSegundos).toBe(3000);
    expect(res.body.totalSessoes).toBe(2);
  });

  it("deve aceitar filtro por atividadeId", async () => {
    const res = await request(app)
      .get(`/dashboard/kpis?atividadeId=${atividadeId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalSegundos");
    expect(res.body).toHaveProperty("totalSessoes");
    expect(res.body).toHaveProperty("streakAtual");
    expect(res.body).toHaveProperty("melhorStreak");
  });

  it("deve retornar 400 quando atividadeId não é uuid", async () => {
    const res = await request(app)
      .get("/dashboard/kpis?atividadeId=nao-uuid")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/dashboard/kpis");
    expect(res.status).toBe(401);
  });
});
