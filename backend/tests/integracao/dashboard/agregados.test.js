import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("Dashboard agregados (por-hora, por-dia-semana, por-modo)", () => {
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

    // 2026-04-06 13:00 BRT (UTC-3) = 2026-04-06 16:00 UTC; segunda-feira (DOW=1)
    // 2026-04-07 20:00 BRT (UTC-3) = 2026-04-07 23:00 UTC; terça-feira (DOW=2)
    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-06T16:00:00.000Z",
        duracaoSegundos: 3600,
        modo: "timer",
      });
    await request(app)
      .post(`/atividades/${atividadeId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        iniciadoEm: "2026-04-07T23:00:00.000Z",
        duracaoSegundos: 1800,
        modo: "pomodoro",
      });
  });

  describe("GET /dashboard/por-hora", () => {
    it("deve retornar buckets das horas com sessões", async () => {
      const res = await request(app)
        .get("/dashboard/por-hora")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      const horas = res.body.map((linha) => linha.hora);
      expect(horas).toContain(13);
      expect(horas).toContain(20);
      const total13 = res.body.find((l) => l.hora === 13).totalSegundos;
      expect(total13).toBe(3600);
    });

    it("deve retornar 401 sem autenticação", async () => {
      const res = await request(app).get("/dashboard/por-hora");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /dashboard/por-dia-semana", () => {
    it("deve retornar buckets dos dias da semana com sessões", async () => {
      const res = await request(app)
        .get("/dashboard/por-dia-semana")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      // 2026-04-06 = segunda (1), 2026-04-07 = terça (2)
      const diaSegunda = res.body.find((l) => l.diaSemana === 1);
      const diaTerca = res.body.find((l) => l.diaSemana === 2);
      expect(diaSegunda.totalSegundos).toBe(3600);
      expect(diaTerca.totalSegundos).toBe(1800);
    });

    it("deve retornar 401 sem autenticação", async () => {
      const res = await request(app).get("/dashboard/por-dia-semana");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /dashboard/por-modo", () => {
    it("deve retornar totais agrupados por modo", async () => {
      const res = await request(app)
        .get("/dashboard/por-modo")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      const timer = res.body.find((l) => l.modo === "timer");
      const pomodoro = res.body.find((l) => l.modo === "pomodoro");
      expect(timer).toEqual({ modo: "timer", totalSegundos: 3600, totalSessoes: 1 });
      expect(pomodoro).toEqual({
        modo: "pomodoro",
        totalSegundos: 1800,
        totalSessoes: 1,
      });
    });

    it("deve retornar 401 sem autenticação", async () => {
      const res = await request(app).get("/dashboard/por-modo");
      expect(res.status).toBe(401);
    });
  });
});
