import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

describe("POST /auth/registrar", () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it("deve registrar um usuario e retornar 201 com tokens e dados do usuário", async () => {
    const res = await request(app)
      .post("/auth/registrar")
      .send({ email: "novo@email.com", nome: "Novo", senha: "senha1234" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.usuario).toMatchObject({ nome: "Novo", email: "novo@email.com" });
    expect(res.body.usuario).toHaveProperty("id");
  });

  it("deve retornar 409 para email duplicado", async () => {
    const dados = { email: "duplo@email.com", nome: "Primeiro", senha: "senha1234" };

    await request(app).post("/auth/registrar").send(dados);

    const res = await request(app)
      .post("/auth/registrar")
      .send({ ...dados, nome: "Segundo" });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("EMAIL_JA_EXISTE");
  });

  it("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .post("/auth/registrar")
      .send({ email: "invalido", nome: "", senha: "123" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
    expect(res.body.erros.length).toBeGreaterThanOrEqual(1);
  });
});
