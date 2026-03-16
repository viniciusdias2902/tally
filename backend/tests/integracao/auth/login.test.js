import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await limparBanco();
    await request(app).post("/auth/registrar").send(USUARIO);
  });

  it("deve retornar 200 com tokens para credenciais válidas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: USUARIO.email, senha: USUARIO.senha });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("deve retornar 401 para email inexistente", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nao@existe.com", senha: "senha1234" });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("CREDENCIAIS_INVALIDAS");
  });

  it("deve retornar 401 para senha errada", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: USUARIO.email, senha: "senhaerrada" });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("CREDENCIAIS_INVALIDAS");
  });

  it("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "invalido" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });
});
