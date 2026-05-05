import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /dashboard/distribuicao", () => {
  let accessToken;
  let pastaId;
  let atividadeNaPastaId;
  let atividadeSemPastaId;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resPasta = await request(app)
      .post("/pastas")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos" });
    pastaId = resPasta.body.id;

    const resAtivPasta = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Inglês", tipoMedicao: "cronometrada", pastaId });
    atividadeNaPastaId = resAtivPasta.body.id;

    const resAtivLivre = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Avulso", tipoMedicao: "cronometrada" });
    atividadeSemPastaId = resAtivLivre.body.id;

    const agora = new Date().toISOString();
    await request(app)
      .post(`/atividades/${atividadeNaPastaId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ iniciadoEm: agora, duracaoSegundos: 3600, modo: "timer" });
    await request(app)
      .post(`/atividades/${atividadeSemPastaId}/sessoes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ iniciadoEm: agora, duracaoSegundos: 1800, modo: "timer" });
  });

  it("deve retornar nível pasta no escopo geral", async () => {
    const res = await request(app)
      .get("/dashboard/distribuicao")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.nivel).toBe("pasta");
    expect(res.body.itens).toHaveLength(2);
    const totalEstudos = res.body.itens.find((i) => i.nome === "Estudos");
    const semPasta = res.body.itens.find((i) => i.nome === "Sem pasta");
    expect(totalEstudos.totalSegundos).toBe(3600);
    expect(semPasta.totalSegundos).toBe(1800);
  });

  it("deve retornar nível atividade quando filtrado por pasta", async () => {
    const res = await request(app)
      .get(`/dashboard/distribuicao?pastaId=${pastaId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.nivel).toBe("atividade");
    expect(res.body.itens).toHaveLength(1);
    expect(res.body.itens[0]).toMatchObject({
      atividadeId: atividadeNaPastaId,
      nome: "Inglês",
      totalSegundos: 3600,
    });
  });

  it("deve retornar nível categoria quando filtrado por atividade", async () => {
    const res = await request(app)
      .get(`/dashboard/distribuicao?atividadeId=${atividadeNaPastaId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.nivel).toBe("categoria");
    expect(res.body.itens).toHaveLength(1);
    expect(res.body.itens[0]).toMatchObject({
      categoriaId: null,
      nome: "Sem categoria",
      totalSegundos: 3600,
    });
  });

  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/dashboard/distribuicao");
    expect(res.status).toBe(401);
  });
});
