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
});
