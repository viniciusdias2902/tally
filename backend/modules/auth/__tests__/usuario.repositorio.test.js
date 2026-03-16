import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarUsuarioRepositorio } from "../usuario.repositorio.js";

function criarPrismaMock() {
  return {
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

describe("usuario.repositorio", () => {
  let prisma;
  let repositorio;

  beforeEach(() => {
    prisma = criarPrismaMock();
    repositorio = criarUsuarioRepositorio(prisma);
  });

  describe("buscarPorEmail", () => {
    it("deve chamar findUnique com o email correto", async () => {
      const usuario = { id: "1", email: "teste@email.com" };
      prisma.usuario.findUnique.mockResolvedValue(usuario);

      const resultado = await repositorio.buscarPorEmail("teste@email.com");

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: "teste@email.com" },
      });
      expect(resultado).toEqual(usuario);
    });

    it("deve retornar null quando não encontrar", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const resultado = await repositorio.buscarPorEmail("nao@existe.com");

      expect(resultado).toBeNull();
    });
  });

  describe("criar", () => {
    it("deve chamar create com os dados corretos", async () => {
      const dados = { email: "novo@email.com", nome: "Novo", senhaHash: "hash123" };
      const usuario = { id: "1", ...dados };
      prisma.usuario.create.mockResolvedValue(usuario);

      const resultado = await repositorio.criar(dados);

      expect(prisma.usuario.create).toHaveBeenCalledWith({ data: dados });
      expect(resultado).toEqual(usuario);
    });
  });

  describe("atualizarRefreshToken", () => {
    it("deve chamar update com id e refreshToken", async () => {
      const usuario = { id: "1", refreshToken: "token123" };
      prisma.usuario.update.mockResolvedValue(usuario);

      const resultado = await repositorio.atualizarRefreshToken("1", "token123");

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { refreshToken: "token123" },
      });
      expect(resultado).toEqual(usuario);
    });

    it("deve aceitar null para limpar o refreshToken", async () => {
      prisma.usuario.update.mockResolvedValue({ id: "1", refreshToken: null });

      await repositorio.atualizarRefreshToken("1", null);

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { refreshToken: null },
      });
    });
  });

  describe("buscarPorId", () => {
    it("deve chamar findUnique com o id correto", async () => {
      const usuario = { id: "1", email: "teste@email.com" };
      prisma.usuario.findUnique.mockResolvedValue(usuario);

      const resultado = await repositorio.buscarPorId("1");

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(resultado).toEqual(usuario);
    });

    it("deve retornar null quando não encontrar", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const resultado = await repositorio.buscarPorId("inexistente");

      expect(resultado).toBeNull();
    });
  });
});
