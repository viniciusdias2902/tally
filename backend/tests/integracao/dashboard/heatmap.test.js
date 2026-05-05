import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /dashboard/heatmap", () => {
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

  it("deve retornar 365 dias por padrão", async () => {
    const res = await request(app)
      .get("/dashboard/heatmap")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(365);
    expect(res.body[0]).toHaveProperty("date");
    expect(res.body[0]).toHaveProperty("count");
  });

  it("deve respeitar o parâmetro desdeDias", async () => {
    const res = await request(app)
      .get("/dashboard/heatmap?desdeDias=10")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  it("deve agregar os minutos de uma sessão registrada", async () => {
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
      .get("/dashboard/heatmap?desdeDias=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].count).toBe(30);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/dashboard/heatmap");
    expect(res.status).toBe(401);
  });
});
