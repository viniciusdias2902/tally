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
});
