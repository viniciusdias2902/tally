import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("PATCH /atividades/:atividadeId/categorias/reordenar", () => {
  let accessToken;
  let atividadeId;
  let categoriaIds;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = resAtiv.body.id;

    // Cria 3 categorias (ordem 0, 1, 2)
    categoriaIds = [];
    for (const nome of ["Alpha", "Beta", "Gamma"]) {
      const res = await request(app)
        .post(`/atividades/${atividadeId}/categorias`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ nome });
      categoriaIds.push(res.body.id);
    }
  });

  it("deve reordenar categorias com array de IDs válidos e retornar 204", async () => {
    // Inverte a ordem: Gamma(2→0), Beta(1→1), Alpha(0→2)
    const novaOrdem = [categoriaIds[2], categoriaIds[1], categoriaIds[0]];

    const res = await request(app)
      .patch(`/atividades/${atividadeId}/categorias/reordenar`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ordenacoes: novaOrdem });

    expect(res.status).toBe(204);

    // Verifica que a listagem reflete a nova ordem
    const resListar = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(resListar.body[0].nome).toBe("Gamma");
    expect(resListar.body[1].nome).toBe("Beta");
    expect(resListar.body[2].nome).toBe("Alpha");
  });

  it("deve retornar 400 quando ordenacoes contém ID inválido (não UUID)", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}/categorias/reordenar`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ordenacoes: ["nao-e-uuid", categoriaIds[0]] });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 quando ordenacoes está vazio", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}/categorias/reordenar`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ordenacoes: [] });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });

  it("deve retornar 400 quando ordenacoes não é enviado", async () => {
    const res = await request(app)
      .patch(`/atividades/${atividadeId}/categorias/reordenar`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("VALIDACAO_FALHOU");
  });
});
