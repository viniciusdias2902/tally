import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /dashboard/evolucao", () => {
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

  it("deve retornar 30 dias por padrão", async () => {
    const res = await request(app)
      .get("/dashboard/evolucao")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(30);
    expect(res.body[0]).toHaveProperty("data");
    expect(res.body[0]).toHaveProperty("totalSegundos");
  });

  it("deve respeitar o parâmetro dias", async () => {
    const res = await request(app)
      .get("/dashboard/evolucao?dias=7")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
  });

  it("deve agregar segundos de uma sessão registrada", async () => {
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

    const res = await request(app)
      .get("/dashboard/evolucao?dias=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].totalSegundos).toBe(1800);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/dashboard/evolucao");
    expect(res.status).toBe(401);
  });
});
