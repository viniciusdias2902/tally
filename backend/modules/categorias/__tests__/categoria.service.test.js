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

  describe("listar", () => {
    it("deve retornar as categorias da atividade", async () => {
      const categorias = [categoriaBase];
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.listarPorAtividade.mockResolvedValue(categorias);

      const resultado = await servico.listar("a1", "u1", { incluirArquivadas: false });

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(repositorio.listarPorAtividade).toHaveBeenCalledWith("a1", { incluirArquivadas: false });
      expect(resultado).toEqual(categorias);
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404)
      );

      await expect(servico.listar("a1", "u1", {})).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.listarPorAtividade).not.toHaveBeenCalled();
    });
  });

  describe("buscar", () => {
    it("deve retornar a categoria quando pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);

      const resultado = await servico.buscar("c1", "u1");

      expect(repositorio.buscarPorId).toHaveBeenCalledWith("c1");
      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(resultado).toEqual(categoriaBase);
    });

    it("deve lançar ErroApp 404 quando a categoria não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.buscar("inexistente", "u1")).rejects.toMatchObject({
        message: "CATEGORIA_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 404 quando a atividade pai não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404)
      );

      await expect(servico.buscar("c1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("atualizar", () => {
    it("deve atualizar e retornar a categoria", async () => {
      const atualizada = { ...categoriaBase, nome: "Lazer" };
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.atualizar.mockResolvedValue(atualizada);

      const resultado = await servico.atualizar("c1", "u1", { nome: "Lazer" });

      expect(repositorio.atualizar).toHaveBeenCalledWith("c1", { nome: "Lazer" });
      expect(resultado).toEqual(atualizada);
    });
  });

  describe("arquivar", () => {
    it("deve arquivar a categoria", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.arquivar.mockResolvedValue({ ...categoriaBase, arquivada: true });

      await servico.arquivar("c1", "u1");

      expect(repositorio.arquivar).toHaveBeenCalledWith("c1");
    });

    it("deve lançar ErroApp 404 se a categoria não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.arquivar("c1", "u1")).rejects.toMatchObject({
        message: "CATEGORIA_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("desarquivar", () => {
    it("deve desarquivar a categoria", async () => {
      const categoriaArquivada = { ...categoriaBase, arquivada: true };
      repositorio.buscarPorId.mockResolvedValue(categoriaArquivada);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.desarquivar.mockResolvedValue({ ...categoriaArquivada, arquivada: false });

      await servico.desarquivar("c1", "u1");

      expect(repositorio.desarquivar).toHaveBeenCalledWith("c1");
    });

    it("deve lançar ErroApp 404 se a categoria não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.desarquivar("c1", "u1")).rejects.toMatchObject({
        message: "CATEGORIA_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("deletar", () => {
    it("deve deletar a categoria quando não há sessões vinculadas", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.possuiSessoes.mockResolvedValue(false);
      repositorio.deletar.mockResolvedValue(categoriaBase);

      await servico.deletar("c1", "u1");

      expect(repositorio.deletar).toHaveBeenCalledWith("c1");
    });

    it("deve lançar ErroApp 409 quando há sessões vinculadas", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.possuiSessoes.mockResolvedValue(true);

      await expect(servico.deletar("c1", "u1")).rejects.toMatchObject({
        message: "CATEGORIA_COM_SESSOES",
        codigoStatus: 409,
      });
      expect(repositorio.deletar).not.toHaveBeenCalled();
    });

    it("deve lançar ErroApp 404 se a categoria não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.deletar("c1", "u1")).rejects.toMatchObject({
        message: "CATEGORIA_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 404 se a atividade pai não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(categoriaBase);
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404)
      );

      await expect(servico.deletar("c1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
      expect(repositorio.possuiSessoes).not.toHaveBeenCalled();
      expect(repositorio.deletar).not.toHaveBeenCalled();
    });
  });

  describe("reordenar", () => {
    it("deve reordenar as categorias da atividade", async () => {
      const ordenacoes = [
        { id: "c1", ordem: 2 },
        { id: "c2", ordem: 0 },
        { id: "c3", ordem: 1 },
      ];
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.atualizarOrdem.mockResolvedValue(undefined);

      await servico.reordenar("a1", "u1", ordenacoes);

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(repositorio.atualizarOrdem).toHaveBeenCalledWith(ordenacoes);
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404)
      );

      await expect(servico.reordenar("a1", "u1", [])).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
      expect(repositorio.atualizarOrdem).not.toHaveBeenCalled();
    });
  });
});
