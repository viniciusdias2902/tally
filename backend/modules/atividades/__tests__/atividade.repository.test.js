import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarAtividadeRepository } from "../atividade.repository.js";

function criarPrismaMock() {
  return {
    atividade: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sessao: {
      count: vi.fn(),
    },
  };
}

describe("atividade.repository", () => {
  let prisma;
  let repositorio;

  beforeEach(() => {
    prisma = criarPrismaMock();
    repositorio = criarAtividadeRepository(prisma);
  });

  describe("criar", () => {
    it("deve chamar create com os dados corretos", async () => {
      const dados = { usuarioId: "u1", nome: "Estudos", tipoMedicao: "cronometrada" };
      const atividade = { id: "a1", ...dados, arquivada: false };
      prisma.atividade.create.mockResolvedValue(atividade);

      const resultado = await repositorio.criar(dados);

      expect(prisma.atividade.create).toHaveBeenCalledWith({ data: dados });
      expect(resultado).toEqual(atividade);
    });
  });

  describe("listarPorUsuario", () => {
    it("deve filtrar por usuarioId e excluir arquivadas por padrão", async () => {
      prisma.atividade.findMany.mockResolvedValue([]);

      await repositorio.listarPorUsuario("u1");

      expect(prisma.atividade.findMany).toHaveBeenCalledWith({
        where: { usuarioId: "u1", arquivada: false },
        orderBy: { criadoEm: "asc" },
      });
    });

    it("deve incluir arquivadas quando solicitado", async () => {
      prisma.atividade.findMany.mockResolvedValue([]);

      await repositorio.listarPorUsuario("u1", { incluirArquivadas: true });

      expect(prisma.atividade.findMany).toHaveBeenCalledWith({
        where: { usuarioId: "u1" },
        orderBy: { criadoEm: "asc" },
      });
    });

    it("deve retornar as atividades encontradas", async () => {
      const atividades = [{ id: "a1", nome: "Estudos" }];
      prisma.atividade.findMany.mockResolvedValue(atividades);

      const resultado = await repositorio.listarPorUsuario("u1");

      expect(resultado).toEqual(atividades);
    });
  });

  describe("buscarPorId", () => {
    it("deve chamar findUnique com o id correto", async () => {
      const atividade = { id: "a1", nome: "Estudos" };
      prisma.atividade.findUnique.mockResolvedValue(atividade);

      const resultado = await repositorio.buscarPorId("a1");

      expect(prisma.atividade.findUnique).toHaveBeenCalledWith({ where: { id: "a1" } });
      expect(resultado).toEqual(atividade);
    });

    it("deve retornar null quando não encontrar", async () => {
      prisma.atividade.findUnique.mockResolvedValue(null);

      const resultado = await repositorio.buscarPorId("inexistente");

      expect(resultado).toBeNull();
    });
  });

  describe("atualizar", () => {
    it("deve chamar update com id e dados corretos", async () => {
      const atividade = { id: "a1", nome: "Leitura" };
      prisma.atividade.update.mockResolvedValue(atividade);

      const resultado = await repositorio.atualizar("a1", { nome: "Leitura" });

      expect(prisma.atividade.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { nome: "Leitura" },
      });
      expect(resultado).toEqual(atividade);
    });
  });

  describe("arquivar", () => {
    it("deve chamar update definindo arquivada como true", async () => {
      const atividade = { id: "a1", arquivada: true };
      prisma.atividade.update.mockResolvedValue(atividade);

      const resultado = await repositorio.arquivar("a1");

      expect(prisma.atividade.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { arquivada: true },
      });
      expect(resultado).toEqual(atividade);
    });
  });

  describe("deletar", () => {
    it("deve chamar delete com o id correto", async () => {
      const atividade = { id: "a1" };
      prisma.atividade.delete.mockResolvedValue(atividade);

      const resultado = await repositorio.deletar("a1");

      expect(prisma.atividade.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
      expect(resultado).toEqual(atividade);
    });
  });

  describe("possuiSessoes", () => {
    it("deve retornar true quando existem sessões vinculadas", async () => {
      prisma.sessao.count.mockResolvedValue(3);

      const resultado = await repositorio.possuiSessoes("a1");

      expect(prisma.sessao.count).toHaveBeenCalledWith({ where: { atividadeId: "a1" } });
      expect(resultado).toBe(true);
    });

    it("deve retornar false quando não existem sessões vinculadas", async () => {
      prisma.sessao.count.mockResolvedValue(0);

      const resultado = await repositorio.possuiSessoes("a1");

      expect(resultado).toBe(false);
    });
  });
});
