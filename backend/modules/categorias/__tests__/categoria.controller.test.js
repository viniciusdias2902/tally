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
});
