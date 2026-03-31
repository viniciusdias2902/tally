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