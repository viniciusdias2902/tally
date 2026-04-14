import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoService } from "../sessao.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

function criarRepositorioMock() {
  return {
    criar: vi.fn(),
    listarPorAtividade: vi.fn(),
    buscarPorId: vi.fn(),
    atualizar: vi.fn(),
    deletar: vi.fn(),
    somarDuracaoPorAtividade: vi.fn(),
  };
}

function criarAtividadeServiceMock() {
  return {
    buscar: vi.fn(),
  };
}

function criarCategoriaServiceMock() {
  return {
    buscar: vi.fn(),
  };
}

const atividadeBase = {
  id: "atividade1",
  usuarioId: "usuario1",
  nome: "Estudos",
  tipoMedicao: "cronometrada",
  arquivada: false,
};

const categoriaBase = {
  id: "categoria1",
  usuarioId: "usuario1",
  nome: "História",
  arquivada: false,
};

const sessaoBase = {
  id: "sessao1",
  atividadeId: "atividade1",
  categoriaId: "categoria1",
  iniciadoEm: new Date("2026-04-08T10:00:00Z"),
  duracaoSegundos: 3600,
  modo: "timer",
  ciclosPomodoro: null,
  observacoes: null,
};

describe("sessao.service", () => {
  let repositorio;
  let atividadeServiceMock;
  let categoriaServiceMock;
  let servico;

  beforeEach(() => {
    repositorio = criarRepositorioMock();
    atividadeServiceMock = criarAtividadeServiceMock();
    categoriaServiceMock = criarCategoriaServiceMock();
    servico = criarSessaoService(repositorio, atividadeServiceMock, categoriaServiceMock);
  });

  describe("criar", () => {
    it("deve criar e retornar a sessão", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      categoriaServiceMock.buscar.mockResolvedValue(categoriaBase);
      repositorio.criar.mockResolvedValue(sessaoBase);

      const resultado = await servico.criar({
        atividadeId: "atividade1",
        categoriaId: "categoria1",
        usuarioId: "usuario1",
        iniciadoEm: sessaoBase.iniciadoEm,
        duracaoSegundos: 3600,
        modo: "timer",
        ciclosPomodoro: null,
        observacoes: null,
      });

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("atividade1", "usuario1");
      expect(categoriaServiceMock.buscar).toHaveBeenCalledWith("categoria1", "usuario1");
      expect(repositorio.criar).toHaveBeenCalledWith({
        atividadeId: "atividade1",
        categoriaId: "categoria1",
        iniciadoEm: sessaoBase.iniciadoEm,
        duracaoSegundos: 3600,
        modo: "timer",
        ciclosPomodoro: null,
        observacoes: null,
      });
      expect(resultado).toEqual(sessaoBase);
    });

    it("deve criar sessão sem categoria", async () => {
      const sessaoSemCategoria = { ...sessaoBase, categoriaId: null };

      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.criar.mockResolvedValue(sessaoSemCategoria);

      const resultado = await servico.criar({
        atividadeId: "atividade1",
        categoriaId: null,
        usuarioId: "usuario1",
        iniciadoEm: sessaoBase.iniciadoEm,
        duracaoSegundos: 3600,
        modo: "timer",
        ciclosPomodoro: null,
        observacoes: null,
      });

      expect(categoriaServiceMock.buscar).not.toHaveBeenCalled();
      expect(resultado).toEqual(sessaoSemCategoria);
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(
        servico.criar({
          atividadeId: "atividade1",
          categoriaId: "categoria1",
          usuarioId: "usuario1",
          iniciadoEm: new Date(),
          duracaoSegundos: 3600,
          modo: "timer",
        }),
      ).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.criar).not.toHaveBeenCalled();
    });

    it("deve lançar ErroApp 422 se a categoria está arquivada", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      categoriaServiceMock.buscar.mockResolvedValue({ ...categoriaBase, arquivada: true });

      await expect(
        servico.criar({
          atividadeId: "atividade1",
          categoriaId: "categoria1",
          usuarioId: "usuario1",
          iniciadoEm: new Date(),
          duracaoSegundos: 3600,
          modo: "timer",
        }),
      ).rejects.toMatchObject({
        message: "CATEGORIA_ARQUIVADA",
        codigoStatus: 422,
      });
      expect(repositorio.criar).not.toHaveBeenCalled();
    });
  });

  describe("listar", () => {
    it("deve retornar as sessões da atividade", async () => {
      const sessoes = [sessaoBase];
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.listarPorAtividade.mockResolvedValue(sessoes);

      const resultado = await servico.listar("atividade1", "usuario1", { categoriaId: "categoria1" });

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("atividade1", "usuario1");
      expect(repositorio.listarPorAtividade).toHaveBeenCalledWith("atividade1", { categoriaId: "categoria1" });
      expect(resultado).toEqual(sessoes);
    });

    it("deve lançar ErroApp 404 se a atividade não pertence ao usuário", async () => {
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(servico.listar("atividade1", "usuario1", {})).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
      expect(repositorio.listarPorAtividade).not.toHaveBeenCalled();
    });
  });

  describe("buscar", () => {
    it("deve retornar a sessão", async () => {
      repositorio.buscarPorId.mockResolvedValue(sessaoBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);

      const resultado = await servico.buscar("sessao1", "usuario1");

      expect(repositorio.buscarPorId).toHaveBeenCalledWith("sessao1");
      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("atividade1", "usuario1");
      expect(resultado).toEqual(sessaoBase);
    });

    it("deve lançar ErroApp 404 quando a sessão não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.buscar("inexistente", "usuario1")).rejects.toMatchObject({
        message: "SESSAO_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 404 quando a atividade não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(sessaoBase);
      atividadeServiceMock.buscar.mockRejectedValue(
        new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404),
      );

      await expect(servico.buscar("sessao1", "usuario1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("atualizar", () => {
    it("deve atualizar e retornar a sessão", async () => {
      const atualizada = { ...sessaoBase, observacoes: "Atualizada" };
      repositorio.buscarPorId.mockResolvedValue(sessaoBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.atualizar.mockResolvedValue(atualizada);

      const resultado = await servico.atualizar("sessao1", "usuario1", {
        observacoes: "Atualizada",
      });

      expect(repositorio.atualizar).toHaveBeenCalledWith("sessao1", {
        observacoes: "Atualizada",
      });
      expect(resultado).toEqual(atualizada);
    });

    it("deve verificar a nova categoria ao trocar categoriaId", async () => {
      const atualizada = { ...sessaoBase, categoriaId: "categoria2" };
      repositorio.buscarPorId.mockResolvedValue(sessaoBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      categoriaServiceMock.buscar.mockResolvedValue({ ...categoriaBase, id: "categoria2", arquivada: false });
      repositorio.atualizar.mockResolvedValue(atualizada);

      const resultado = await servico.atualizar("sessao1", "usuario1", {
        categoriaId: "categoria2",
      });

      expect(categoriaServiceMock.buscar).toHaveBeenCalledWith("categoria2", "usuario1");
      expect(resultado).toEqual(atualizada);
    });

    it("deve lançar ErroApp 404 se a sessão não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(
        servico.atualizar("sessao1", "usuario1", { observacoes: "Teste" }),
      ).rejects.toMatchObject({
        message: "SESSAO_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("deletar", () => {
    it("deve deletar a sessão", async () => {
      repositorio.buscarPorId.mockResolvedValue(sessaoBase);
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.deletar.mockResolvedValue(sessaoBase);

      await servico.deletar("sessao1", "usuario1");

      expect(repositorio.buscarPorId).toHaveBeenCalledWith("sessao1");
    });

    it("deve lançar ErroApp 404 se a sessão não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.deletar("sessao1", "usuario1")).rejects.toMatchObject({
        message: "SESSAO_NAO_ENCONTRADA",
        codigoStatus: 404,
      });

      expect(repositorio.deletar).not.toHaveBeenCalled();
    });
  });

  describe("somarDuracao", () => {
    it("deve retornar a soma da duração das sessões", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.somarDuracaoPorAtividade.mockResolvedValue({
        _sum: { duracaoSegundos: 10800 },
      });

      const resultado = await servico.somarDuracao("atividade1", "usuario1");

      expect(atividadeServiceMock.buscar).toHaveBeenCalledWith("atividade1", "usuario1");
      expect(repositorio.somarDuracaoPorAtividade).toHaveBeenCalledWith("atividade1");
      expect(resultado).toBe(10800);
    });

    it("deve retornar 0 quando não houver sessões", async () => {
      atividadeServiceMock.buscar.mockResolvedValue(atividadeBase);
      repositorio.somarDuracaoPorAtividade.mockResolvedValue({
        _sum: { duracaoSegundos: null },
      });

      const resultado = await servico.somarDuracao("atividade1", "usuario1");

      expect(resultado).toBe(0);
    });
  });
});
