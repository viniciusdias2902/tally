import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarAtividadeService } from "../atividade.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

function criarRepositorioMock() {
  return {
    criar: vi.fn(),
    listarPorUsuario: vi.fn(),
    buscarPorId: vi.fn(),
    atualizar: vi.fn(),
    arquivar: vi.fn(),
    arquivarCategorias: vi.fn(),
    deletar: vi.fn(),
    possuiSessoes: vi.fn(),
  };
}

const atividadeBase = {
  id: "a1",
  usuarioId: "u1",
  nome: "Estudos",
  tipoMedicao: "cronometrada",
  arquivada: false,
};

describe("atividade.service", () => {
  let repositorio;
  let servico;

  beforeEach(() => {
    repositorio = criarRepositorioMock();
    servico = criarAtividadeService(repositorio);
  });

  describe("criar", () => {
    it("deve criar e retornar a atividade", async () => {
      repositorio.criar.mockResolvedValue(atividadeBase);

      const resultado = await servico.criar({
        usuarioId: "u1",
        nome: "Estudos",
        tipoMedicao: "cronometrada",
      });

      expect(repositorio.criar).toHaveBeenCalledWith({
        usuarioId: "u1",
        nome: "Estudos",
        tipoMedicao: "cronometrada",
      });
      expect(resultado).toEqual(atividadeBase);
    });

    it("deve lançar ErroApp 409 se nome já existe para o usuário", async () => {
      repositorio.criar.mockRejectedValue({ code: "P2002" });

      await expect(
        servico.criar({ usuarioId: "u1", nome: "Estudos", tipoMedicao: "cronometrada" })
      ).rejects.toMatchObject({ message: "ATIVIDADE_JA_EXISTE", codigoStatus: 409 });
    });

    it("deve relançar erros desconhecidos", async () => {
      const erroDesconhecido = new Error("falha inesperada");
      repositorio.criar.mockRejectedValue(erroDesconhecido);

      await expect(
        servico.criar({ usuarioId: "u1", nome: "Estudos", tipoMedicao: "cronometrada" })
      ).rejects.toThrow("falha inesperada");
    });
  });

  describe("listar", () => {
    it("deve retornar as atividades do usuário", async () => {
      const atividades = [atividadeBase];
      repositorio.listarPorUsuario.mockResolvedValue(atividades);

      const resultado = await servico.listar("u1", { incluirArquivadas: false });

      expect(repositorio.listarPorUsuario).toHaveBeenCalledWith("u1", { incluirArquivadas: false });
      expect(resultado).toEqual(atividades);
    });
  });

  describe("buscar", () => {
    it("deve retornar a atividade quando pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);

      const resultado = await servico.buscar("a1", "u1");

      expect(resultado).toEqual(atividadeBase);
    });

    it("deve lançar ErroApp 404 quando a atividade não existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.buscar("inexistente", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 404 quando a atividade pertence a outro usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue({ ...atividadeBase, usuarioId: "outro" });

      await expect(servico.buscar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("atualizar", () => {
    it("deve atualizar e retornar a atividade", async () => {
      const atualizada = { ...atividadeBase, nome: "Leitura" };
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.atualizar.mockResolvedValue(atualizada);

      const resultado = await servico.atualizar("a1", "u1", { nome: "Leitura" });

      expect(repositorio.atualizar).toHaveBeenCalledWith("a1", { nome: "Leitura" });
      expect(resultado).toEqual(atualizada);
    });

    it("deve lançar ErroApp 404 se atividade não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.atualizar("a1", "u1", { nome: "Leitura" })).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });

    it("deve lançar ErroApp 409 se o novo nome já existe", async () => {
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.atualizar.mockRejectedValue({ code: "P2002" });

      await expect(servico.atualizar("a1", "u1", { nome: "Leitura" })).rejects.toMatchObject({
        message: "ATIVIDADE_JA_EXISTE",
        codigoStatus: 409,
      });
    });

    it("deve relançar erros desconhecidos", async () => {
      const erroDesconhecido = new Error("falha inesperada");
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.atualizar.mockRejectedValue(erroDesconhecido);

      await expect(servico.atualizar("a1", "u1", { nome: "Leitura" })).rejects.toThrow("falha inesperada");
    });
  });

  describe("arquivar", () => {
    it("deve arquivar categorias e depois a atividade", async () => {
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.arquivarCategorias.mockResolvedValue({ count: 2 });
      repositorio.arquivar.mockResolvedValue({ ...atividadeBase, arquivada: true });

      await servico.arquivar("a1", "u1");

      expect(repositorio.arquivarCategorias).toHaveBeenCalledWith("a1");
      expect(repositorio.arquivar).toHaveBeenCalledWith("a1");
    });

    it("deve arquivar categorias antes da atividade", async () => {
      const ordem = [];
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.arquivarCategorias.mockImplementation(async () => ordem.push("categorias"));
      repositorio.arquivar.mockImplementation(async () => ordem.push("atividade"));

      await servico.arquivar("a1", "u1");

      expect(ordem).toEqual(["categorias", "atividade"]);
    });

    it("deve lançar ErroApp 404 se atividade não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.arquivar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });

  describe("deletar", () => {
    it("deve deletar a atividade quando não há sessões", async () => {
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.possuiSessoes.mockResolvedValue(false);
      repositorio.deletar.mockResolvedValue(atividadeBase);

      await servico.deletar("a1", "u1");

      expect(repositorio.deletar).toHaveBeenCalledWith("a1");
    });

    it("deve lançar ErroApp 409 quando há sessões vinculadas", async () => {
      repositorio.buscarPorId.mockResolvedValue(atividadeBase);
      repositorio.possuiSessoes.mockResolvedValue(true);

      await expect(servico.deletar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_COM_SESSOES",
        codigoStatus: 409,
      });
      expect(repositorio.deletar).not.toHaveBeenCalled();
    });

    it("deve lançar ErroApp 404 se atividade não pertence ao usuário", async () => {
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(servico.deletar("a1", "u1")).rejects.toMatchObject({
        message: "ATIVIDADE_NAO_ENCONTRADA",
        codigoStatus: 404,
      });
    });
  });
});
