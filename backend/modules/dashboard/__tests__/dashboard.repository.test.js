import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarDashboardRepository } from "../dashboard.repository.js";

function criarPrismaMock() {
  return {
    $queryRaw: vi.fn(),
  };
}

describe("dashboard.repository", () => {
  let prismaMock;
  let repositorio;

  beforeEach(() => {
    prismaMock = criarPrismaMock();
    repositorio = criarDashboardRepository(prismaMock);
  });

  describe("somarSegundosPorDia", () => {
    it("deve mapear dia e total_segundos para o formato camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia: new Date("2026-04-01"), total_segundos: 3600 },
        { dia: new Date("2026-04-02"), total_segundos: 1800 },
      ]);

      const resultado = await repositorio.somarSegundosPorDia({
        usuarioId: "u1",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-05-01"),
      });

      expect(prismaMock.$queryRaw).toHaveBeenCalledOnce();
      expect(resultado).toEqual([
        { dia: new Date("2026-04-01"), totalSegundos: 3600 },
        { dia: new Date("2026-04-02"), totalSegundos: 1800 },
      ]);
    });

    it("deve retornar lista vazia quando não há sessões", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      const resultado = await repositorio.somarSegundosPorDia({
        usuarioId: "u1",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-05-01"),
      });

      expect(resultado).toEqual([]);
    });

    it("deve passar pastaId como parâmetro do filtro quando fornecido", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarSegundosPorDia({
        usuarioId: "u1",
        pastaId: "p1",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-05-01"),
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("p1");
    });

    it("deve passar pastaId nulo por padrão", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarSegundosPorDia({
        usuarioId: "u1",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-05-01"),
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain(null);
    });

    it("deve passar atividadeId como parâmetro do filtro quando fornecido", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarSegundosPorDia({
        usuarioId: "u1",
        atividadeId: "a1",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-05-01"),
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("a1");
    });
  });

  describe("somarTotaisGerais", () => {
    it("deve mapear total_segundos e total_sessoes para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { total_segundos: 7200, total_sessoes: 5 },
      ]);

      const resultado = await repositorio.somarTotaisGerais({ usuarioId: "u1" });

      expect(resultado).toEqual({ totalSegundos: 7200, totalSessoes: 5 });
    });

    it("deve passar pastaId como filtro quando fornecido", async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ total_segundos: 0, total_sessoes: 0 }]);

      await repositorio.somarTotaisGerais({ usuarioId: "u1", pastaId: "p1" });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("p1");
    });
  });

  describe("somarPorPastaDoUsuario", () => {
    it("deve mapear pasta_id e total_segundos para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { pasta_id: "p1", nome: "Estudos", total_segundos: 7200 },
        { pasta_id: null, nome: "Sem pasta", total_segundos: 1800 },
      ]);

      const resultado = await repositorio.somarPorPastaDoUsuario({ usuarioId: "u1" });

      expect(resultado).toEqual([
        { pastaId: "p1", nome: "Estudos", totalSegundos: 7200 },
        { pastaId: null, nome: "Sem pasta", totalSegundos: 1800 },
      ]);
    });

    it("deve retornar lista vazia quando não há sessões", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      const resultado = await repositorio.somarPorPastaDoUsuario({ usuarioId: "u1" });

      expect(resultado).toEqual([]);
    });
  });

  describe("somarPorAtividadeNaPasta", () => {
    it("deve mapear atividade_id e total_segundos para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { atividade_id: "a1", nome: "Inglês", total_segundos: 5400 },
        { atividade_id: "a2", nome: "Matemática", total_segundos: 3600 },
      ]);

      const resultado = await repositorio.somarPorAtividadeNaPasta({
        usuarioId: "u1",
        pastaId: "p1",
      });

      expect(resultado).toEqual([
        { atividadeId: "a1", nome: "Inglês", totalSegundos: 5400 },
        { atividadeId: "a2", nome: "Matemática", totalSegundos: 3600 },
      ]);
    });

    it("deve passar usuarioId e pastaId como filtros", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarPorAtividadeNaPasta({
        usuarioId: "u1",
        pastaId: "p1",
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("u1");
      expect(valores).toContain("p1");
    });
  });

  describe("somarPorCategoriaNaAtividade", () => {
    it("deve mapear categoria_id, cor e total_segundos para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { categoria_id: "c1", nome: "Leitura", cor: "#FF0000", total_segundos: 4500 },
        { categoria_id: null, nome: "Sem categoria", cor: null, total_segundos: 1500 },
      ]);

      const resultado = await repositorio.somarPorCategoriaNaAtividade({
        usuarioId: "u1",
        atividadeId: "a1",
      });

      expect(resultado).toEqual([
        { categoriaId: "c1", nome: "Leitura", cor: "#FF0000", totalSegundos: 4500 },
        { categoriaId: null, nome: "Sem categoria", cor: null, totalSegundos: 1500 },
      ]);
    });

    it("deve passar usuarioId e atividadeId como filtros", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarPorCategoriaNaAtividade({
        usuarioId: "u1",
        atividadeId: "a1",
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("u1");
      expect(valores).toContain("a1");
    });
  });

  describe("somarPorHoraDoDia", () => {
    it("deve mapear hora e total_segundos para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { hora: 9, total_segundos: 3600 },
        { hora: 14, total_segundos: 1800 },
      ]);

      const resultado = await repositorio.somarPorHoraDoDia({ usuarioId: "u1" });

      expect(resultado).toEqual([
        { hora: 9, totalSegundos: 3600 },
        { hora: 14, totalSegundos: 1800 },
      ]);
    });

    it("deve passar pastaId e atividadeId como filtros", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarPorHoraDoDia({
        usuarioId: "u1",
        pastaId: "p1",
        atividadeId: "a1",
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("p1");
      expect(valores).toContain("a1");
    });
  });

  describe("somarPorDiaDaSemana", () => {
    it("deve mapear dia_semana e total_segundos para camelCase", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia_semana: 1, total_segundos: 7200 },
        { dia_semana: 5, total_segundos: 3600 },
      ]);

      const resultado = await repositorio.somarPorDiaDaSemana({ usuarioId: "u1" });

      expect(resultado).toEqual([
        { diaSemana: 1, totalSegundos: 7200 },
        { diaSemana: 5, totalSegundos: 3600 },
      ]);
    });

    it("deve passar pastaId e atividadeId como filtros", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await repositorio.somarPorDiaDaSemana({
        usuarioId: "u1",
        pastaId: "p1",
        atividadeId: "a1",
      });

      const [, ...valores] = prismaMock.$queryRaw.mock.calls[0];
      expect(valores).toContain("p1");
      expect(valores).toContain("a1");
    });
  });

  describe("calcularStreaks", () => {
    it("deve retornar zero quando não há sessões", async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      const resultado = await repositorio.calcularStreaks({ usuarioId: "u1" });

      expect(resultado).toEqual({ streakAtual: 0, melhorStreak: 0 });
    });

    it("deve identificar streak contínuo terminando hoje", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia: new Date("2026-04-03T00:00:00Z") },
        { dia: new Date("2026-04-04T00:00:00Z") },
        { dia: new Date("2026-04-05T00:00:00Z") },
      ]);

      const resultado = await repositorio.calcularStreaks({
        usuarioId: "u1",
        agora: new Date("2026-04-05T12:00:00Z"),
      });

      expect(resultado).toEqual({ streakAtual: 3, melhorStreak: 3 });
    });

    it("deve calcular melhor streak distinto do atual", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia: new Date("2026-04-01T00:00:00Z") },
        { dia: new Date("2026-04-02T00:00:00Z") },
        { dia: new Date("2026-04-03T00:00:00Z") },
        { dia: new Date("2026-04-04T00:00:00Z") },
        { dia: new Date("2026-04-09T00:00:00Z") },
        { dia: new Date("2026-04-10T00:00:00Z") },
      ]);

      const resultado = await repositorio.calcularStreaks({
        usuarioId: "u1",
        agora: new Date("2026-04-10T12:00:00Z"),
      });

      expect(resultado).toEqual({ streakAtual: 2, melhorStreak: 4 });
    });

    it("deve zerar streak atual se último dia não for hoje nem ontem", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia: new Date("2026-04-01T00:00:00Z") },
        { dia: new Date("2026-04-02T00:00:00Z") },
      ]);

      const resultado = await repositorio.calcularStreaks({
        usuarioId: "u1",
        agora: new Date("2026-04-10T12:00:00Z"),
      });

      expect(resultado.streakAtual).toBe(0);
      expect(resultado.melhorStreak).toBe(2);
    });

    it("deve aceitar streak atual quando último dia foi ontem", async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { dia: new Date("2026-04-04T00:00:00Z") },
        { dia: new Date("2026-04-05T00:00:00Z") },
      ]);

      const resultado = await repositorio.calcularStreaks({
        usuarioId: "u1",
        agora: new Date("2026-04-06T12:00:00Z"),
      });

      expect(resultado.streakAtual).toBe(2);
    });
  });
});
