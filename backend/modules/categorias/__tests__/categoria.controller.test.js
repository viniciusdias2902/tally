import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarCategoriaController } from "../categoria.controller.js";

function criarServicoMock() {
  return {
    criar: vi.fn(),
    listar: vi.fn(),
    buscar: vi.fn(),
    atualizar: vi.fn(),
    arquivar: vi.fn(),
    desarquivar: vi.fn(),
    deletar: vi.fn(),
    reordenar: vi.fn(),
  };
}

function criarRes() {
  const res = {
    statusCode: 200,
    corpo: undefined,
    finalizado: false,
    status(codigo) {
      res.statusCode = codigo;
      return res;
    },
    json(dados) {
      res.corpo = dados;
      return res;
    },
    end() {
      res.finalizado = true;
      return res;
    },
  };
  return res;
}

const categoriaBase = {
  id: "c1",
  atividadeId: "a1",
  nome: "Trabalho",
  cor: "#FF5733",
  ordem: 0,
  arquivada: false,
};

describe("categoria.controller", () => {
  let servico;
  let controller;

  beforeEach(() => {
    servico = criarServicoMock();
    controller = criarCategoriaController(servico);
  });

  describe("criar", () => {
    it("deve chamar servico.criar com os dados corretos e retornar 201", async () => {
      servico.criar.mockResolvedValue(categoriaBase);
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        body: { nome: "Trabalho", cor: "#FF5733" },
      };
      const res = criarRes();

      await controller.criar(req, res);

      expect(servico.criar).toHaveBeenCalledWith({
        atividadeId: "a1",
        usuarioId: "u1",
        nome: "Trabalho",
        cor: "#FF5733",
      });
      expect(res.statusCode).toBe(201);
      expect(res.corpo).toEqual(categoriaBase);
    });

    it("deve propagar erro do servico", async () => {
      servico.criar.mockRejectedValue(new Error("CATEGORIA_JA_EXISTE"));
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        body: { nome: "Trabalho", cor: "#FF5733" },
      };
      const res = criarRes();

      await expect(controller.criar(req, res)).rejects.toThrow("CATEGORIA_JA_EXISTE");
    });
  });

  describe("listar", () => {
    it("deve chamar servico.listar com atividadeId, usuarioId e opcoes e retornar 200", async () => {
      const categorias = [categoriaBase];
      servico.listar.mockResolvedValue(categorias);
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        query: { incluirArquivadas: "false" },
      };
      const res = criarRes();

      await controller.listar(req, res);

      expect(servico.listar).toHaveBeenCalledWith("a1", "u1", { incluirArquivadas: false });
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(categorias);
    });

    it("deve passar incluirArquivadas como true quando query for 'true'", async () => {
      servico.listar.mockResolvedValue([]);
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        query: { incluirArquivadas: "true" },
      };
      const res = criarRes();

      await controller.listar(req, res);

      expect(servico.listar).toHaveBeenCalledWith("a1", "u1", { incluirArquivadas: true });
    });

    it("deve propagar erro do servico", async () => {
      servico.listar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        query: { incluirArquivadas: "false" },
      };
      const res = criarRes();

      await expect(controller.listar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
    });
  });

  describe("buscar", () => {
    it("deve chamar servico.buscar com id e usuarioId e retornar 200", async () => {
      servico.buscar.mockResolvedValue(categoriaBase);
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await controller.buscar(req, res);

      expect(servico.buscar).toHaveBeenCalledWith("c1", "u1");
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(categoriaBase);
    });

    it("deve propagar erro do servico", async () => {
      servico.buscar.mockRejectedValue(new Error("CATEGORIA_NAO_ENCONTRADA"));
      const req = { usuarioId: "u1", params: { id: "inexistente" } };
      const res = criarRes();

      await expect(controller.buscar(req, res)).rejects.toThrow("CATEGORIA_NAO_ENCONTRADA");
    });
  });

  describe("atualizar", () => {
    it("deve chamar servico.atualizar com id, usuarioId e body e retornar 200", async () => {
      const atualizada = { ...categoriaBase, nome: "Lazer" };
      servico.atualizar.mockResolvedValue(atualizada);
      const req = { usuarioId: "u1", params: { id: "c1" }, body: { nome: "Lazer" } };
      const res = criarRes();

      await controller.atualizar(req, res);

      expect(servico.atualizar).toHaveBeenCalledWith("c1", "u1", { nome: "Lazer" });
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(atualizada);
    });

    it("deve propagar erro do servico", async () => {
      servico.atualizar.mockRejectedValue(new Error("CATEGORIA_JA_EXISTE"));
      const req = { usuarioId: "u1", params: { id: "c1" }, body: { nome: "Lazer" } };
      const res = criarRes();

      await expect(controller.atualizar(req, res)).rejects.toThrow("CATEGORIA_JA_EXISTE");
    });
  });

  describe("arquivar", () => {
    it("deve chamar servico.arquivar com id e usuarioId e retornar 204", async () => {
      servico.arquivar.mockResolvedValue(null);
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await controller.arquivar(req, res);

      expect(servico.arquivar).toHaveBeenCalledWith("c1", "u1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.arquivar.mockRejectedValue(new Error("CATEGORIA_NAO_ENCONTRADA"));
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await expect(controller.arquivar(req, res)).rejects.toThrow("CATEGORIA_NAO_ENCONTRADA");
    });
  });

  describe("desarquivar", () => {
    it("deve chamar servico.desarquivar com id e usuarioId e retornar 204", async () => {
      servico.desarquivar.mockResolvedValue(null);
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await controller.desarquivar(req, res);

      expect(servico.desarquivar).toHaveBeenCalledWith("c1", "u1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.desarquivar.mockRejectedValue(new Error("CATEGORIA_NAO_ENCONTRADA"));
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await expect(controller.desarquivar(req, res)).rejects.toThrow("CATEGORIA_NAO_ENCONTRADA");
    });
  });

  describe("deletar", () => {
    it("deve chamar servico.deletar com id e usuarioId e retornar 204", async () => {
      servico.deletar.mockResolvedValue(null);
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await controller.deletar(req, res);

      expect(servico.deletar).toHaveBeenCalledWith("c1", "u1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.deletar.mockRejectedValue(new Error("CATEGORIA_COM_SESSOES"));
      const req = { usuarioId: "u1", params: { id: "c1" } };
      const res = criarRes();

      await expect(controller.deletar(req, res)).rejects.toThrow("CATEGORIA_COM_SESSOES");
    });
  });

  describe("reordenar", () => {
    it("deve chamar servico.reordenar com atividadeId, usuarioId e ordenacoes e retornar 204", async () => {
      const ordenacoes = ["c1", "c2"];
      servico.reordenar.mockResolvedValue(null);
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        body: { ordenacoes },
      };
      const res = criarRes();

      await controller.reordenar(req, res);

      expect(servico.reordenar).toHaveBeenCalledWith("a1", "u1", ordenacoes);
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.reordenar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
      const req = {
        usuarioId: "u1",
        params: { atividadeId: "a1" },
        body: { ordenacoes: [] },
      };
      const res = criarRes();

      await expect(controller.reordenar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
    });
  });
});
