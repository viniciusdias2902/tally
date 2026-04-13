import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("PUT /atividades/:atividadeId/config-pomodoro", () => {
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

  it("deve criar configuração com valores padrão e retornar 200", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      atividadeId,
      minutosFoco: 25,
      minutosPausaCurta: 5,
      minutosPausaLonga: 15,
      ciclosAntesLonga: 4,
    });
    expect(res.body).toHaveProperty("id");
  });

  it("deve criar configuração com valores personalizados", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        minutosFoco: 50,
        minutosPausaCurta: 10,
        minutosPausaLonga: 30,
        ciclosAntesLonga: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      minutosFoco: 50,
      minutosPausaCurta: 10,
      minutosPausaLonga: 30,
      ciclosAntesLonga: 2,
    });
  });

  it("deve atualizar configuração existente", async () => {
    await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 25 });

    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 45 });

    expect(res.status).toBe(200);
    expect(res.body.minutosFoco).toBe(45);
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .put(`/atividades/${uuidInexistente}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 25 });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 400 para minutosFoco menor que 1", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 0 });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 para valor não inteiro", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 25.5 });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .send({ minutosFoco: 25 });

    expect(res.status).toBe(401);
  });
});
