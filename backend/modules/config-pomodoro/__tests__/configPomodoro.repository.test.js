import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarConfigPomodoroRepository } from "../configPomodoro.repository.js";

function criarPrismaMock() {
  return {
    configPomodoro: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe("ConfigPomodoro Repository", () => {
  let prismaMock;
  let repositorio;

  beforeEach(() => {
    prismaMock = criarPrismaMock();
    repositorio = criarConfigPomodoroRepository(prismaMock);
  });

  it("deve buscar configuração por atividadeId", async () => {
    const config = { id: "cp1", atividadeId: "a1", minutosFoco: 25 };
    prismaMock.configPomodoro.findUnique.mockResolvedValue(config);

    const resultado = await repositorio.buscarPorAtividade("a1");

    expect(prismaMock.configPomodoro.findUnique).toHaveBeenCalledWith({
      where: { atividadeId: "a1" },
    });
    expect(resultado).toEqual(config);
  });

  it("deve fazer upsert da configuração", async () => {
    const dados = {
      atividadeId: "a1",
      minutosFoco: 30,
      minutosPausaCurta: 10,
      minutosPausaLonga: 20,
      ciclosAntesLonga: 3,
    };
    const configCriada = { id: "cp1", ...dados };
    prismaMock.configPomodoro.upsert.mockResolvedValue(configCriada);

    const resultado = await repositorio.upsert(dados);

    const { atividadeId, ...dadosSemAtividade } = dados;
    expect(prismaMock.configPomodoro.upsert).toHaveBeenCalledWith({
      where: { atividadeId: "a1" },
      create: dados,
      update: dadosSemAtividade,
    });
    expect(resultado).toEqual(configCriada);
  });

  it("deve deletar configuração por atividadeId", async () => {
    prismaMock.configPomodoro.delete.mockResolvedValue({ id: "cp1" });

    await repositorio.deletarPorAtividade("a1");

    expect(prismaMock.configPomodoro.delete).toHaveBeenCalledWith({
      where: { atividadeId: "a1" },
    });
  });
});
