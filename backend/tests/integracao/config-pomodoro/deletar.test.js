import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("DELETE /atividades/:atividadeId/config-pomodoro", () => {
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

  it("deve deletar a configuração existente e retornar 204", async () => {
    await request(app)
      .put(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ minutosFoco: 30 });

    const res = await request(app)
      .delete(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it("deve retornar 404 quando não há configuração para deletar", async () => {
    const res = await request(app)
      .delete(`/atividades/${atividadeId}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("CONFIG_POMODORO_NAO_ENCONTRADA");
  });

  it("deve retornar 404 para atividade inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .delete(`/atividades/${uuidInexistente}/config-pomodoro`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("ATIVIDADE_NAO_ENCONTRADA");
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .delete(`/atividades/${atividadeId}/config-pomodoro`);

    expect(res.status).toBe(401);
  });
});
