import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarConfigPomodoroController } from "../configPomodoro.controller.js";

function criarServiceMock() {
  return {
    buscar: vi.fn(),
    upsert: vi.fn(),
    deletar: vi.fn(),
  };
}

function criarRes() {
  const res = {
    json: vi.fn(),
    end: vi.fn(),
    status: vi.fn(),
  };
  return res;
}

function criarReq({ params = {}, usuarioId = "u1", body = {} } = {}) {
  return { params, usuarioId, body };
}

describe("configPomodoro.controller", () => {
  let serviceMock;
  let controller;

  beforeEach(() => {
    serviceMock = criarServiceMock();
    controller = criarConfigPomodoroController(serviceMock);
  });

  describe("buscar", () => {
    it("deve chamar service.buscar com atividadeId e usuarioId corretos", async () => {
      const configMock = { tempoFoco: 25, tempoPausa: 5 };
      serviceMock.buscar.mockResolvedValue(configMock);

      const req = criarReq({ params: { atividadeId: "a1" }, usuarioId: "u1" });
      const res = criarRes();

      await controller.buscar(req, res);

      expect(serviceMock.buscar).toHaveBeenCalledWith("a1", "u1");
    });

    it("deve retornar via res.json exatamente o que o service retorna", async () => {
      const configMock = { tempoFoco: 25, tempoPausa: 5 };
      serviceMock.buscar.mockResolvedValue(configMock);

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await controller.buscar(req, res);

      expect(res.json).toHaveBeenCalledWith(configMock);
    });

    it("deve retornar status 200 implícito (res.json chamado sem res.status)", async () => {
      serviceMock.buscar.mockResolvedValue({});

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await controller.buscar(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro quando o service lança exceção", async () => {
      const erro = new Error("FALHA_SERVICE");
      serviceMock.buscar.mockRejectedValue(erro);

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await expect(controller.buscar(req, res)).rejects.toThrow("FALHA_SERVICE");
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("upsert", () => {
    it("deve chamar service.upsert com atividadeId, usuarioId e body mesclados", async () => {
      const body = { tempoFoco: 30, tempoPausa: 10 };
      const configMock = { atividadeId: "a1", usuarioId: "u1", ...body };
      serviceMock.upsert.mockResolvedValue(configMock);

      const req = criarReq({
        params: { atividadeId: "a1" },
        usuarioId: "u1",
        body,
      });
      const res = criarRes();

      await controller.upsert(req, res);

      expect(serviceMock.upsert).toHaveBeenCalledWith({
        atividadeId: "a1",
        usuarioId: "u1",
        tempoFoco: 30,
        tempoPausa: 10,
      });
    });

    it("deve retornar via res.json exatamente o que o service retorna", async () => {
      const configMock = { id: "cfg1", tempoFoco: 50 };
      serviceMock.upsert.mockResolvedValue(configMock);

      const req = criarReq({
        params: { atividadeId: "a1" },
        body: { tempoFoco: 50 },
      });
      const res = criarRes();

      await controller.upsert(req, res);

      expect(res.json).toHaveBeenCalledWith(configMock);
    });

    it("deve retornar status 200 implícito (res.json chamado sem res.status)", async () => {
      serviceMock.upsert.mockResolvedValue({});

      const req = criarReq({ params: { atividadeId: "a1" }, body: {} });
      const res = criarRes();

      await controller.upsert(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro quando o service lança exceção", async () => {
      const erro = new Error("FALHA_UPSERT");
      serviceMock.upsert.mockRejectedValue(erro);

      const req = criarReq({ params: { atividadeId: "a1" }, body: {} });
      const res = criarRes();

      await expect(controller.upsert(req, res)).rejects.toThrow("FALHA_UPSERT");
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("deletar", () => {
    it("deve chamar service.deletar com atividadeId e usuarioId corretos", async () => {
      serviceMock.deletar.mockResolvedValue(undefined);

      const req = criarReq({ params: { atividadeId: "a1" }, usuarioId: "u1" });
      const res = criarRes();

      await controller.deletar(req, res);

      expect(serviceMock.deletar).toHaveBeenCalledWith("a1", "u1");
    });

    it("deve retornar status 204 e chamar end()", async () => {
      serviceMock.deletar.mockResolvedValue(undefined);

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await controller.deletar(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("não deve chamar res.json no método deletar", async () => {
      serviceMock.deletar.mockResolvedValue(undefined);

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await controller.deletar(req, res);

      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve propagar erro quando o service lança exceção", async () => {
      const erro = new Error("FALHA_DELETAR");
      serviceMock.deletar.mockRejectedValue(erro);

      const req = criarReq({ params: { atividadeId: "a1" } });
      const res = criarRes();

      await expect(controller.deletar(req, res)).rejects.toThrow("FALHA_DELETAR");
      expect(res.status).not.toHaveBeenCalled();
      expect(res.end).not.toHaveBeenCalled();
    });
  });
});
