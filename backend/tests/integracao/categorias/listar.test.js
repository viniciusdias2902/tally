import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("GET /atividades/:atividadeId/categorias", () => {
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

  it("deve listar categorias ordenadas por ordem (sortOrder) ASC", async () => {
    // Cria 3 categorias — ordem será 0, 1, 2 automaticamente
    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Terceira" });

    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Primeira" });

    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Segunda" });

    const res = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    expect(res.body[0].nome).toBe("Terceira");
    expect(res.body[1].nome).toBe("Primeira");
    expect(res.body[2].nome).toBe("Segunda");
  });
});
