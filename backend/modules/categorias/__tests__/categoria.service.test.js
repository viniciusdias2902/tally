import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarCategoriaService } from "../categoria.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

function criarRepositorioMock() {
  return {
    criar: vi.fn(),
    listarPorAtividade: vi.fn(),
    buscarPorId: vi.fn(),
    atualizar: vi.fn(),
    arquivar: vi.fn(),
    desarquivar: vi.fn(),
    deletar: vi.fn(),
    possuiSessoes: vi.fn(),
    contarPorAtividade: vi.fn(),
    atualizarOrdem: vi.fn(),
  };
}

function criarAtividadeServiceMock() {
  return {
    buscar: vi.fn(),
  };
}

const categoriaBase = {
  id: "c1",
  atividadeId: "a1",
  nome: "Trabalho",
  cor: "#FF5733",
  ordem: 0,
  arquivada: false,
};

const atividadeBase = {
  id: "a1",
  usuarioId: "u1",
  nome: "Estudos",
  tipoMedicao: "cronometrada",
  arquivada: false,
};

describe("categoria.service", () => {
  let repositorio;
  let atividadeServiceMock;
  let servico;

  beforeEach(() => {
    repositorio = criarRepositorioMock();
    atividadeServiceMock = criarAtividadeServiceMock();
    servico = criarCategoriaService(repositorio, atividadeServiceMock);
  });

  describe("criar", () => {
    it("deve criar e retornar a categoria com ordem calculada automaticamente", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.contarPorAtividade.mockResolvedValue(3);
      repositorio.criar.mockResolvedValue({ ...categoriaBase, ordem: 3 });

      const resultado = await servico.criar({
        atividadeId: "a1",
        usuarioId: "u1",
        nome: "Trabalho",
        cor: "#FF5733",
      });

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(repositorio.contarPorAtividade).toHaveBeenCalledWith("a1");
      expect(repositorio.criar).toHaveBeenCalledWith({
        atividadeId: "a1",
        nome: "Trabalho",
        cor: "#FF5733",
        ordem: 3,
      });
      expect(resultado).toEqual({ ...categoriaBase, ordem: 3 });
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404)
      );

      await expect(
        servico.criar({ atividadeId: "a1", usuarioId: "u1", nome: "Trabalho", cor: "#FF5733" })
      ).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.criar).not.toHaveBeenCalled();
    });

    it("deve lançar ErroApp 409 se nome já existe (P2002)", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.contarPorAtividade.mockResolvedValue(0);
      repositorio.criar.mockRejectedValue({ code: "P2002" });

      await expect(
        servico.criar({ atividadeId: "a1", usuarioId: "u1", nome: "Trabalho", cor: "#FF5733" })
      ).rejects.toMatchObject({
        message: "CATEGORIA_JA_EXISTE",
        codigoStatus: 409,
      });
    });

    it("deve relançar erros desconhecidos", async () => {
      const erroDesconhecido = new Error("falha inesperada");
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.contarPorAtividade.mockResolvedValue(0);
      repositorio.criar.mockRejectedValue(erroDesconhecido);

      await expect(
        servico.criar({ atividadeId: "a1", usuarioId: "u1", nome: "Trabalho", cor: "#FF5733" })
      ).rejects.toThrow("falha inesperada");
    });
  });
});
