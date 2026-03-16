import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarAuthController } from "../auth.controller.js";

function criarServicoMock() {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
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

describe("auth.controller", () => {
  let servico;
  let controller;

  beforeEach(() => {
    servico = criarServicoMock();
    controller = criarAuthController(servico);
  });

  describe("registrar", () => {
    it("deve chamar servico.registrar com req.body e retornar 201", async () => {
      const tokens = { accessToken: "at", refreshToken: "rt" };
      servico.registrar.mockResolvedValue(tokens);
      const req = { body: { email: "t@e.com", nome: "T", senha: "12345678" } };
      const res = criarRes();

      await controller.registrar(req, res);

      expect(servico.registrar).toHaveBeenCalledWith(req.body);
      expect(res.statusCode).toBe(201);
      expect(res.corpo).toEqual(tokens);
    });

    it("deve propagar erro do servico", async () => {
      servico.registrar.mockRejectedValue(new Error("EMAIL_JA_EXISTE"));
      const req = { body: {} };
      const res = criarRes();

      await expect(controller.registrar(req, res)).rejects.toThrow("EMAIL_JA_EXISTE");
    });
  });

  describe("login", () => {
    it("deve chamar servico.login com req.body e retornar 200", async () => {
      const tokens = { accessToken: "at", refreshToken: "rt" };
      servico.login.mockResolvedValue(tokens);
      const req = { body: { email: "t@e.com", senha: "12345678" } };
      const res = criarRes();

      await controller.login(req, res);

      expect(servico.login).toHaveBeenCalledWith(req.body);
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(tokens);
    });

    it("deve propagar erro do servico", async () => {
      servico.login.mockRejectedValue(new Error("CREDENCIAIS_INVALIDAS"));
      const req = { body: {} };
      const res = criarRes();

      await expect(controller.login(req, res)).rejects.toThrow("CREDENCIAIS_INVALIDAS");
    });
  });

  describe("refresh", () => {
    it("deve chamar servico.refresh com refreshToken do body e retornar 200", async () => {
      const tokens = { accessToken: "at2", refreshToken: "rt2" };
      servico.refresh.mockResolvedValue(tokens);
      const req = { body: { refreshToken: "rt1" } };
      const res = criarRes();

      await controller.refresh(req, res);

      expect(servico.refresh).toHaveBeenCalledWith("rt1");
      expect(res.statusCode).toBe(200);
      expect(res.corpo).toEqual(tokens);
    });

    it("deve propagar erro do servico", async () => {
      servico.refresh.mockRejectedValue(new Error("REFRESH_TOKEN_INVALIDO"));
      const req = { body: { refreshToken: "invalido" } };
      const res = criarRes();

      await expect(controller.refresh(req, res)).rejects.toThrow("REFRESH_TOKEN_INVALIDO");
    });
  });

  describe("logout", () => {
    it("deve chamar servico.logout com req.usuarioId e retornar 204", async () => {
      servico.logout.mockResolvedValue(null);
      const req = { usuarioId: "1" };
      const res = criarRes();

      await controller.logout(req, res);

      expect(servico.logout).toHaveBeenCalledWith("1");
      expect(res.statusCode).toBe(204);
      expect(res.finalizado).toBe(true);
    });
  });
});
