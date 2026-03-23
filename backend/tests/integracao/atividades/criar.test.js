import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /atividades", () => {
  let accessToken;

  beforeEach(async () => {
    await limparBanco();
    const res = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = res.body.accessToken;
  });

  it("deve criar uma atividade e retornar 201", async () => {
    const res = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nome: "Estudos", tipoMedicao: "cronometrada", arquivada: false });
    expect(res.body).toHaveProperty("id");
  });

  it("deve retornar 409 para nome duplicado no mesmo usuário", async () => {
    await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    const res = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "binaria" });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("ATIVIDADE_JA_EXISTE");
  });

  it("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "", tipoMedicao: "invalido" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app)
      .post("/atividades")
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });

    expect(res.status).toBe(401);
  });
});
