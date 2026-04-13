import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarConfigPomodoroService } from "../configPomodoro.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

function criarRepositorioMock() {
  return {
    buscarPorAtividade: vi.fn(),
    upsert: vi.fn(),
    deletarPorAtividade: vi.fn(),
  };
}

function criarAtividadeServiceMock() {
  return {
    buscar: vi.fn(),
  };
}

const atividadeBase = {
  id: "a1",
  usuarioId: "u1",
  nome: "Estudos",
  tipoMedicao: "cronometrada",
  arquivada: false,
};

const configBase = {
  id: "cp1",
  atividadeId: "a1",
  minutosFoco: 25,
  minutosPausaCurta: 5,
  minutosPausaLonga: 15,
  ciclosAntesLonga: 4,
};

describe("configPomodoro.service", () => {
  let repositorio;
  let atividadeServiceMock;
  let servico;

  beforeEach(() => {
    repositorio = criarRepositorioMock();
    atividadeServiceMock = criarAtividadeServiceMock();
    servico = criarConfigPomodoroService(repositorio, atividadeServiceMock);
  });

  describe("buscar", () => {
    it("deve retornar a configuração quando existe", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.buscarPorAtividade.mockResolvedValue(configBase);

      const resultado = await servico.buscar("a1", "u1");

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(repositorio.buscarPorAtividade).toHaveBeenCalledWith("a1");
      expect(resultado).toEqual(configBase);
    });

    it("deve lançar ErroApp 404 quando a configuração não existe", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.buscarPorAtividade.mockResolvedValue(null);

      await expect(servico.buscar("a1", "u1")).rejects.toMatchObject({
        message: "CONFIG_POMODORO_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(servico.buscar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.buscarPorAtividade).not.toHaveBeenCalled();
    });
  });

  describe("upsert", () => {
    it("deve criar ou atualizar a configuração", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.upsert.mockResolvedValue(configBase);

      const resultado = await servico.upsert({
        atividadeId: "a1",
        usuarioId: "u1",
        minutosFoco: 25,
        minutosPausaCurta: 5,
        minutosPausaLonga: 15,
        ciclosAntesLonga: 4,
      });

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(repositorio.upsert).toHaveBeenCalledWith({
        atividadeId: "a1",
        minutosFoco: 25,
        minutosPausaCurta: 5,
        minutosPausaLonga: 15,
        ciclosAntesLonga: 4,
      });
      expect(resultado).toEqual(configBase);
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(
        servico.upsert({ atividadeId: "a1", usuarioId: "u1", minutosFoco: 25 }),
      ).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.upsert).not.toHaveBeenCalled();
    });
  });

  describe("deletar", () => {
    it("deve deletar a configuração quando existe", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.buscarPorAtividade.mockResolvedValue(configBase);
      repositorio.deletarPorAtividade.mockResolvedValue(configBase);

      await servico.deletar("a1", "u1");

      expect(repositorio.deletarPorAtividade).toHaveBeenCalledWith("a1");
    });

    it("deve lançar ErroApp 404 quando a configuração não existe", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.buscarPorAtividade.mockResolvedValue(null);

      await expect(servico.deletar("a1", "u1")).rejects.toMatchObject({
        message: "CONFIG_POMODORO_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.deletarPorAtividade).not.toHaveBeenCalled();
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(servico.deletar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.buscarPorAtividade).not.toHaveBeenCalled();
      expect(repositorio.deletarPorAtividade).not.toHaveBeenCalled();
    });
  });
});
