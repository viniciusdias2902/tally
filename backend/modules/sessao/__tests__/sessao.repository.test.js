import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoRepository } from "../sessao.repository.js";

function criarPrismaMock() {
  return {
    sessao: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  };
}

describe("sessao.repository", () => {
  let prismaMock;
  let repositorio;

  beforeEach(() => {
    prismaMock = criarPrismaMock();
    repositorio = criarSessaoRepository(prismaMock);
  });

  it("deve criar uma nova sessão", async () => {
    const dadosSessao = {
      atividadeId: "a1",
      categoriaId: "c1",
      iniciadoEm: new Date(),
      duracaoSegundos: 3600,
      modo: "timer",
      ciclosPomodoro: null,
      observacoes: "Sessão de estudo",
    };
    const sessaoCriada = { ...dadosSessao, id: "s1" };
    prismaMock.sessao.create.mockResolvedValue(sessaoCriada);

    const resultado = await repositorio.criar(dadosSessao);

    expect(prismaMock.sessao.create).toHaveBeenCalledWith({ data: dadosSessao });
    expect(resultado).toEqual(sessaoCriada);
  });

  it("deve listar sessões por atividade", async () => {
    const sessoes = [
      { id: "s1", atividadeId: "a1", categoriaId: "c1", iniciadoEm: new Date(), duracaoSegundos: 3600 },
      { id: "s2", atividadeId: "a1", categoriaId: "c2", iniciadoEm: new Date(), duracaoSegundos: 1800 },
    ];
    prismaMock.sessao.findMany.mockResolvedValue(sessoes);

    const resultado = await repositorio.listarPorAtividade("a1", { categoriaId: "c1" });

    expect(prismaMock.sessao.findMany).toHaveBeenCalledWith({
      where: { atividadeId: "a1", categoriaId: "c1" },
      orderBy: { iniciadoEm: "desc" },
      take: 20,
      include: { categoria: true },
    });
    expect(resultado).toEqual(sessoes);
  });

  it("deve buscar uma sessão pelo seu id", async () => {
    const sessao = {
      id: "s1", atividadeId: "a1", categoriaId: "c1", iniciadoEm: new Date(), duracaoSegundos: 3600,
    };
    prismaMock.sessao.findUnique.mockResolvedValue(sessao);

    const resultado = await repositorio.buscarPorId("s1");

    expect(prismaMock.sessao.findUnique).toHaveBeenCalledWith({
      where: { id: "s1" },
      include: { categoria: true },
    });
    expect(resultado).toEqual(sessao);
  });

  it("deve atualizar uma sessão", async () => {
    const dadosAtualizados = { duracaoSegundos: 5400, observacoes: "Atualizada" };
    const sessaoAtualizada = { id: "s1", atividadeId: "a1", ...dadosAtualizados };
    prismaMock.sessao.update.mockResolvedValue(sessaoAtualizada);

    const resultado = await repositorio.atualizar("s1", dadosAtualizados);

    expect(prismaMock.sessao.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: dadosAtualizados,
    });
    expect(resultado).toEqual(sessaoAtualizada);
  });

  it("deve deletar uma sessão", async () => {
    prismaMock.sessao.delete.mockResolvedValue({ id: "s1" });

    await repositorio.deletar("s1");

    expect(prismaMock.sessao.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("deve contar sessões por atividade", async () => {
    prismaMock.sessao.count.mockResolvedValue(10);

    const resultado = await repositorio.contarPorAtividade("a1");

    expect(prismaMock.sessao.count).toHaveBeenCalledWith({ where: { atividadeId: "a1" } });
    expect(resultado).toBe(10);
  });

  it("deve contar sessões por categoria", async () => {
    prismaMock.sessao.count.mockResolvedValue(3);

    const resultado = await repositorio.contarPorCategoria("c1");

    expect(prismaMock.sessao.count).toHaveBeenCalledWith({ where: { categoriaId: "c1" } });
    expect(resultado).toBe(3);
  });

  it("deve somar a duração das sessões por atividade", async () => {
    prismaMock.sessao.aggregate.mockResolvedValue({ _sum: { duracaoSegundos: 10800 } });

    const resultado = await repositorio.somarDuracaoPorAtividade("a1");

    expect(prismaMock.sessao.aggregate).toHaveBeenCalledWith({
      where: { atividadeId: "a1" },
      _sum: { duracaoSegundos: true },
    });
    expect(resultado).toEqual({ _sum: { duracaoSegundos: 10800 } });
  });
});
