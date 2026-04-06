import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import { limparBanco } from "../../helpers.js";

const USUARIO = { email: "teste@email.com", nome: "Teste", senha: "senha1234" };
const OUTRO_USUARIO = { email: "outro@email.com", nome: "Outro", senha: "senha1234" };

describe("PUT /atividades/:atividadeId/categorias/:id", () => {
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
      .send({ nome: "Trabalho", cor: "#FF5733" });
    categoriaId = resCat.body.id;
  });

  it("deve atualizar nome e cor da categoria e retornar 200", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Lazer", cor: "#00FF00" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: categoriaId,
      nome: "Lazer",
      cor: "#00FF00",
    });
  });

  it("deve atualizar somente o nome quando cor não é enviada", async () => {
    const res = await request(app)
      .put(`/atividades/${atividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Lazer" });

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Lazer");
    expect(res.body.cor).toBe("#FF5733"); // mantém a cor original
  });

  it("deve retornar 404 ao tentar atualizar categoria de outra atividade", async () => {
    // Registra outro usuário e cria outra atividade com outra categoria
    const resOutro = await request(app).post("/auth/registrar").send(OUTRO_USUARIO);
    const outroToken = resOutro.body.accessToken;

    const resOutraAtiv = await request(app)
      .post("/atividades")
      .set("Authorization", `Bearer ${outroToken}`)
      .send({ nome: "Exercícios", tipoMedicao: "cronometrada" });
    const outraAtividadeId = resOutraAtiv.body.id;

    // Tenta atualizar a categoria do primeiro usuário usando a atividade do segundo
    const res = await request(app)
      .put(`/atividades/${outraAtividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${outroToken}`)
      .send({ nome: "Hackeado" });

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 para categoria inexistente", async () => {
    const uuidInexistente = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .put(`/atividades/${atividadeId}/categorias/${uuidInexistente}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Nova" });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe("CATEGORIA_NAO_ENCONTRADA");
  });

  it("deve retornar 409 ao atualizar para nome duplicado na mesma atividade", async () => {
    // Cria segunda categoria
    await request(app)
      .post(`/atividades/${atividadeId}/categorias`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Lazer" });

    // Tenta renomear a primeira para o nome da segunda
    const res = await request(app)
      .put(`/atividades/${atividadeId}/categorias/${categoriaId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nome: "Lazer" });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("CATEGORIA_JA_EXISTE");
  });
});
