import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("POST /auth/logout", () => {
  let accessToken;
  let refreshToken;

  beforeEach(async () => {
    await limparBanco();
    const res = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("deve retornar 204 com token válido", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it("deve invalidar o refreshToken após logout", async () => {
    await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("REFRESH_TOKEN_INVALIDO");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).post("/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("TOKEN_NAO_FORNECIDO");
  });
});
