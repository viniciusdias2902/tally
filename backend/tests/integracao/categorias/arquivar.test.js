import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };

describe("PATCH /atividades/:atividadeId/categorias/:id/arquivar e /desarquivar", () => {
  let accessToken;
  let atividadeId;
  let categoriaId;

  beforeEach(async () => {
    await limparBanco();
    const resAuth = await request(app).post("/auth/registrar").send(USUARIO);
    accessToken = resAuth.body.accessToken;

    const resAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Estudos", tipoMedicao: "cronometrada" });
    atividadeId = resAtiv.body.id;

    const resCat = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Trabalho" });
    categoriaId = resCat.body.id;
  });

  describe("Arquivar", () => {
    it("deve arquivar a categoria e retornar 204", async () => {
      const res = await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${categoriaId}/arquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verifica que a categoria agora está arquivada
      const resListar = await request(app)
        .get(`/atividades/${atividadeId}/categorias`)
        .query({ incluirArquivadas: "true" })
        .set("Authorization", `Bearer ${accessToken}`);

      const categoria = resListar.body.find((c) => c.id === categoriaId);
      expect(categoria.arquivada).toBe(true);
    });

    it("deve excluir categoria arquivada da listagem padrão", async () => {
      await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${categoriaId}/arquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      const res = await request(app)
        .get(`/atividades/${atividadeId}/categorias`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.body).toHaveLength(0);
    });

    it("deve retornar 404 para categoria inexistente", async () => {

      const res = await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${uuidInexistente}/arquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Desarquivar", () => {
    it("deve desarquivar a categoria e retornar 204", async () => {
      // Primeiro arquiva
      await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${categoriaId}/arquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Depois desarquiva
      const res = await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${categoriaId}/desarquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verifica que a categoria voltou a ser ativa
      const resListar = await request(app)
        .get(`/atividades/${atividadeId}/categorias`)
        .set("Authorization", `Bearer ${accessToken}`);

      const categoria = resListar.body.find((c) => c.id === categoriaId);
      expect(categoria.arquivada).toBe(false);
    });

    it("deve retornar 404 para categoria inexistente", async () => {
      const uuidInexistente = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .patch(`/atividades/${atividadeId}/categorias/${uuidInexistente}/desarquivar`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
