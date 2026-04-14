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
});
