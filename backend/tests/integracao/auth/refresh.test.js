import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /auth/refresh", () => {
  let refreshToken;

  beforeEach(async () => {
    await limparBanco();
    const res = await request(app).post("/auth/registrar").send(USUARIO);
    refreshToken = res.body.refreshToken;
  });

  it("deve retornar 200 com novos tokens", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("deve invalidar o refreshToken anterior após rotação", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: USUARIO.email, senha: USUARIO.senha });
    const novoRefreshToken = loginRes.body.refreshToken;

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("REFRESH_TOKEN_INVALIDO");

    const resNovo = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: novoRefreshToken });

    expect(resNovo.status).toBe(200);
  });

  it("deve retornar 401 para token inválido", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "token-invalido" });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("REFRESH_TOKEN_INVALIDO");
  });

  it("deve retornar 400 para body vazio", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });
});
