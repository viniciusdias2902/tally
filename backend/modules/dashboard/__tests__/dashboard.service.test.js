import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarDashboardService } from "../dashboard.service.js";

describe("dashboard.service", () => {
  let repositorioMock;
  let servico;

  beforeEach(() => {
    repositorioMock = {
      somarSegundosPorDia: vi.fn(),
      somarTotaisGerais: vi.fn(),
      calcularStreaks: vi.fn(),
    };
    servico = criarDashboardService(repositorioMock);
  });

  describe("gerarHeatmap", () => {
    it("deve preencher dias sem sessões com count zero", async () => {
      const agora = new Date("2026-04-05T12:00:00Z");
      repositorioMock.somarSegundosPorDia.mockResolvedValue([
        { dia: new Date("2026-04-03T00:00:00Z"), totalSegundos: 1800 },
        { dia: new Date("2026-04-05T00:00:00Z"), totalSegundos: 3600 },
      ]);

      const heatmap = await servico.gerarHeatmap({
        usuarioId: "u1",
        desdeDias: 5,
        agora,
      });

      expect(heatmap).toEqual([
        { date: "2026-04-01", count: 0 },
        { date: "2026-04-02", count: 0 },
        { date: "2026-04-03", count: 30 },
        { date: "2026-04-04", count: 0 },
        { date: "2026-04-05", count: 60 },
      ]);
    });

    it("deve repassar pastaId e atividadeId ao repositório", async () => {
      repositorioMock.somarSegundosPorDia.mockResolvedValue([]);

      await servico.gerarHeatmap({
        usuarioId: "u1",
        pastaId: "p1",
        atividadeId: "a1",
        desdeDias: 1,
        agora: new Date("2026-04-01T12:00:00Z"),
      });

      expect(repositorioMock.somarSegundosPorDia).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarioId: "u1",
          pastaId: "p1",
          atividadeId: "a1",
        }),
      );
    });

    it("deve usar 365 dias por padrão", async () => {
      repositorioMock.somarSegundosPorDia.mockResolvedValue([]);

      const heatmap = await servico.gerarHeatmap({
        usuarioId: "u1",
        agora: new Date("2026-04-01T12:00:00Z"),
      });

      expect(heatmap).toHaveLength(365);
    });
  });

  describe("obterKpis", () => {
    it("deve combinar totais com streaks (escopo geral)", async () => {
      repositorioMock.somarTotaisGerais.mockResolvedValue({
        totalSegundos: 7200,
        totalSessoes: 5,
      });
      repositorioMock.calcularStreaks.mockResolvedValue({
        streakAtual: 3,
        melhorStreak: 5,
      });

      const kpis = await servico.obterKpis({ usuarioId: "u1" });

      expect(kpis).toEqual({
        totalSegundos: 7200,
        totalSessoes: 5,
        streakAtual: 3,
        melhorStreak: 5,
      });
    });

    it("deve repassar pastaId aos repositórios", async () => {
      repositorioMock.somarTotaisGerais.mockResolvedValue({
        totalSegundos: 0,
        totalSessoes: 0,
      });
      repositorioMock.calcularStreaks.mockResolvedValue({
        streakAtual: 0,
        melhorStreak: 0,
      });

      await servico.obterKpis({ usuarioId: "u1", pastaId: "p1" });

      expect(repositorioMock.somarTotaisGerais).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: "u1", pastaId: "p1" }),
      );
      expect(repositorioMock.calcularStreaks).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: "u1", pastaId: "p1" }),
      );
    });

    it("deve repassar atividadeId aos repositórios", async () => {
      repositorioMock.somarTotaisGerais.mockResolvedValue({
        totalSegundos: 0,
        totalSessoes: 0,
      });
      repositorioMock.calcularStreaks.mockResolvedValue({
        streakAtual: 0,
        melhorStreak: 0,
      });

      await servico.obterKpis({ usuarioId: "u1", atividadeId: "a1" });

      expect(repositorioMock.somarTotaisGerais).toHaveBeenCalledWith(
        expect.objectContaining({ atividadeId: "a1" }),
      );
    });
  });
});
