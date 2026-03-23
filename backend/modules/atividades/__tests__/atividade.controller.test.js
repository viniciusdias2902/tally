import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarAtividadeController } from "../atividade.controller.js";

function criarServicoMock() {
  return {
    criar: vi.fn(),
    listar: vi.fn(),
    buscar: vi.fn(),
    atualizar: vi.fn(),
    arquivar: vi.fn(),
    deletar: vi.fn(),
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

const atividadeBase = {
  id: "a1",
  usuarioId: "u1",
  nome: "Estudos",
  tipoMedicao: "cronometrada",
  arquivada: false,
};

describe("atividade.controller", () => {
  let servico;
  let controller;

  beforeEach(() => {
    servico = criarServicoMock();
    controller = criarAtividadeController(servico);
  });

  describe("criar", () => {
    it("deve chamar servico.criar com os dados corretos e retornar 201", async () => {
      servico.criar.mockResolvedValue(atividadeBase);
      const req = {
        usuarioId: "u1",
        body: { nome: "Estudos", tipoMedicao: "cronometrada" },
      };
      const res = criarRes();

      await controller.criar(req, res);

      expect(servico.criar).toHaveBeenCalledWith({
        usuarioId: "u1",
        nome: "Estudos",
        tipoMedicao: "cronometrada",
      });
      expect(res.statusCode).toBe(201);
      expect(res.corpo).toEqual(atividadeBase);
    });

    it("deve propagar erro do servico", async () => {
      servico.criar.mockRejectedValue(new Error("ATIVIDADE_JA_EXISTE"));
      const req = { usuarioId: "u1", body: { nome: "Estudos", tipoMedicao: "cronometrada" } };
      const res = criarRes();

      await expect(controller.criar(req, res)).rejects.toThrow("ATIVIDADE_JA_EXISTE");
    });
  });

  describe("listar", () => {
    it("deve chamar servico.listar com usuarioId e opcoes e retornar 200", async () => {
      const atividades = [atividadeBase];
      servico.listar.mockResolvedValue(atividades);
      const req = { usuarioId: "u1", query: { incluirArquivadas: "false" } };
      const res = criarRes();

      await controller.listar(req, res);

      expect(servico.listar).toHaveBeenCalledWith("u1", { incluirArquivadas: false });
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(atividades);
    });

    it("deve passar incluirArquivadas como true quando query for 'true'", async () => {
      servico.listar.mockResolvedValue([]);
      const req = { usuarioId: "u1", query: { incluirArquivadas: "true" } };
      const res = criarRes();

      await controller.listar(req, res);

      expect(servico.listar).toHaveBeenCalledWith("u1", { incluirArquivadas: true });
    });
  });

  describe("buscar", () => {
    it("deve chamar servico.buscar com id e usuarioId e retornar 200", async () => {
      servico.buscar.mockResolvedValue(atividadeBase);
      const req = { usuarioId: "u1", params: { id: "a1" } };
      const res = criarRes();

      await controller.buscar(req, res);

      expect(servico.buscar).toHaveBeenCalledWith("a1", "u1");
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(atividadeBase);
    });

    it("deve propagar erro do servico", async () => {
      servico.buscar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
      const req = { usuarioId: "u1", params: { id: "inexistente" } };
      const res = criarRes();

      await expect(controller.buscar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
    });
  });

  describe("atualizar", () => {
    it("deve chamar servico.atualizar com id, usuarioId e body e retornar 200", async () => {
      const atualizada = { ...atividadeBase, nome: "Leitura" };
      servico.atualizar.mockResolvedValue(atualizada);
      const req = { usuarioId: "u1", params: { id: "a1" }, body: { nome: "Leitura" } };
      const res = criarRes();

      await controller.atualizar(req, res);

      expect(servico.atualizar).toHaveBeenCalledWith("a1", "u1", { nome: "Leitura" });
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(atualizada);
    });

    it("deve propagar erro do servico", async () => {
      servico.atualizar.mockRejectedValue(new Error("ATIVIDADE_JA_EXISTE"));
      const req = { usuarioId: "u1", params: { id: "a1" }, body: { nome: "Leitura" } };
      const res = criarRes();

      await expect(controller.atualizar(req, res)).rejects.toThrow("ATIVIDADE_JA_EXISTE");
    });
  });

  describe("arquivar", () => {
    it("deve chamar servico.arquivar com id e usuarioId e retornar 204", async () => {
      servico.arquivar.mockResolvedValue(null);
      const req = { usuarioId: "u1", params: { id: "a1" } };
      const res = criarRes();

      await controller.arquivar(req, res);

      expect(servico.arquivar).toHaveBeenCalledWith("a1", "u1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.arquivar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
      const req = { usuarioId: "u1", params: { id: "a1" } };
      const res = criarRes();

      await expect(controller.arquivar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
    });
  });

  describe("deletar", () => {
    it("deve chamar servico.deletar com id e usuarioId e retornar 204", async () => {
      servico.deletar.mockResolvedValue(null);
      const req = { usuarioId: "u1", params: { id: "a1" } };
      const res = criarRes();

      await controller.deletar(req, res);

      expect(servico.deletar).toHaveBeenCalledWith("a1", "u1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });

    it("deve propagar erro do servico", async () => {
      servico.deletar.mockRejectedValue(new Error("ATIVIDADE_COM_SESSOES"));
      const req = { usuarioId: "u1", params: { id: "a1" } };
      const res = criarRes();

      await expect(controller.deletar(req, res)).rejects.toThrow("ATIVIDADE_COM_SESSOES");
    });
  });
});
