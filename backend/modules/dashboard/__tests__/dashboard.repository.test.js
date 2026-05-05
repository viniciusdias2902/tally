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
  });
});
