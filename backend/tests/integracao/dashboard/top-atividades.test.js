import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /dashboard/top-atividades", () => {
  let accessToken;
  let pastaId;
  let atividade1Id;
  let atividade2Id;
  let atividade3Id;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resPasta = await request(app)
      .post("/pastas")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos" });
    pastaId = resPasta.body.id;

    const r1 = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Inglês", tipoMedicao: "cronometrada", pastaId });
    atividade1Id = r1.body.id;

    const r2 = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Matemática", tipoMedicao: "cronometrada", pastaId });
    atividade2Id = r2.body.id;

    const r3 = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Avulso", tipoMedicao: "cronometrada" });
    atividade3Id = r3.body.id;

    const agora = new Date().toISOString();
    await request(app)
      .post(`/atividades/${atividade1Id}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ iniciadoEm: agora, duracaoSegundos: 7200, modo: "timer" });
    await request(app)
      .post(`/atividades/${atividade2Id}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ iniciadoEm: agora, duracaoSegundos: 1800, modo: "timer" });
    await request(app)
      .post(`/atividades/${atividade3Id}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ iniciadoEm: agora, duracaoSegundos: 3600, modo: "timer" });
  });

  it("deve retornar atividades ordenadas por totalSegundos desc", async () => {
    const res = await request(app)
      .get("/dashboard/top-atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({
      atividadeId: atividade1Id,
      nome: "Inglês",
      pastaNome: "Estudos",
      totalSegundos: 7200,
    });
    expect(res.body[1].atividadeId).toBe(atividade3Id);
    expect(res.body[2].atividadeId).toBe(atividade2Id);
  });

  it("deve retornar pastaNome null quando atividade não tem pasta", async () => {
    const res = await request(app)
      .get("/dashboard/top-atividades")
      .set("Authorization", `Bearer ${accessToken}`);

    const avulso = res.body.find((l) => l.nome === "Avulso");
    expect(avulso.pastaNome).toBeNull();
  });

  it("deve respeitar o parâmetro limite", async () => {
    const res = await request(app)
      .get("/dashboard/top-atividades?limite=2")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/dashboard/top-atividades");
    expect(res.status).toBe(401);
  });
});
