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

    // Verifica ordem crescente pelo campo 'ordem'
    const ordens = res.body.map((c) => c.ordem);
    expect(ordens).toEqual([0, 1, 2]);

    // A primeira criada deve ter ordem 0
    expect(res.body[0].nome).toBe("Terceira");
    expect(res.body[1].nome).toBe("Primeira");
    expect(res.body[2].nome).toBe("Segunda");
  });

  it("deve excluir categorias arquivadas por padrão", async () => {
    const resCat = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Ativa" });

    const resCatArq = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Arquivada" });

    // Arquiva a segunda categoria
    await request(app)
      .patch(`/atividades/${atividadeId}/categorias/${resCatArq.body.id}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nome).toBe("Ativa");
  });

  it("deve incluir categorias arquivadas quando incluirArquivadas=true", async () => {
    const resCat = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Ativa" });

    const resCatArq = await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Arquivada" });

    // Arquiva a segunda categoria
    await request(app)
      .patch(`/atividades/${atividadeId}/categorias/${resCatArq.body.id}/arquivar`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .query({ incluirArquivadas: "true" })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const nomes = res.body.map((c) => c.nome);
    expect(nomes).toContain("Ativa");
    expect(nomes).toContain("Arquivada");
  });

  it("deve retornar array vazio quando não há categorias", async () => {
    const res = await request(app)
      .get(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
