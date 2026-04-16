import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoController } from "../sessao.controller.js";

function criarServicoMock() {
    return {
        criar: vi.fn(),
        listar: vi.fn(),
        buscar: vi.fn(),
        atualizar: vi.fn(),
        somarDuracao: vi.fn(),
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

const sessaoBase = {
    id: "sessao1",
    usuarioId: "usuario1",
    atividadeId: "atividade1",
    inicio: "2023-01-01T10:00:00.000Z",
    fim: "2023-01-01T11:00:00.000Z",
    duracao: 3600,
};

describe("sessao.controller", () => {
    let servico;
    let controller;

    beforeEach(() => {
        servico = criarServicoMock();
        controller = criarSessaoController(servico);
    });

    describe("criar", () => {
        it("deve chamar servico.criar com os dados corretos e retornar 201", async () => {
            servico.criar.mockResolvedValue(sessaoBase);
            const req = {
                usuarioId: "usuario1",
                params: { atividadeId: "atividade1" },
                body: {
                    categoriaId: null,
                    iniciadoEm: "2023-01-01T10:00:00.000Z",
                    duracaoSegundos: 3600,
                    modo: "cronometro",
                    ciclosPomodoro: null,
                    observacoes: null,
                },
            };
            const res = criarRes();

            await controller.criar(req, res);

            expect(servico.criar).toHaveBeenCalledWith({
                atividadeId: "atividade1",
                usuarioId: "usuario1",
                categoriaId: null,
                iniciadoEm: "2023-01-01T10:00:00.000Z",
                duracaoSegundos: 3600,
                modo: "cronometro",
                ciclosPomodoro: null,
                observacoes: null,
            });
            expect(res.statusCode).toBe(201);
            expect(res.corpo).toEqual(sessaoBase);
        });

        it("deve propagar erro do servico", async () => {
            servico.criar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
            const req = {
                usuarioId: "usuario1",
                params: { atividadeId: "atividade1" },
                body: { iniciadoEm: "2023-01-01T10:00:00.000Z", duracaoSegundos: 3600, modo: "cronometro" },
            };
            const res = criarRes();


            await expect(controller.criar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
        });
    });

    describe("listar", () => {
        it("deve chamar servico.listar com atividadeId, usuarioId e query e retornar 200", async () => {
            const sessoes = [sessaoBase];
            servico.listar.mockResolvedValue(sessoes);
            const req = {
                usuarioId: "usuario1",
                params: { atividadeId: "atividade1" },
                query: { limite: "10" },
            };
            const res = criarRes();

            await controller.listar(req, res);

            expect(servico.listar).toHaveBeenCalledWith("atividade1", "usuario1", { limite: "10" });
            expect(res.statusCode).toBe(200);
            expect(res.corpo).toEqual(sessoes);
        });

        it("deve propagar erro do serviço", async () => {
            servico.listar.mockRejectedValue(new Error("ATIVIDADE_NAO_ENCONTRADA"));
            const req = {
                usuarioId: "usuario1",
                params: { atividadeId: "atividade1" },
                query: {},
            };
            const res = criarRes();

            await expect(controller.listar(req, res)).rejects.toThrow("ATIVIDADE_NAO_ENCONTRADA");
        });
    });

    describe("buscar", () => {
        it("deve chamar servico.buscar com id e usuarioId e retornar 200", async () => {
            servico.buscar.mockResolvedValue(sessaoBase);
            const req = {
                usuarioId: "usuario1",
                params: { id: "sessao1" }
            };

            const res = criarRes();

            await controller.buscar(req, res);

            expect(servico.buscar).toHaveBeenCalledWith("sessao1", "usuario1");
            expect(res.statusCode).toBe(200);
            expect(res.corpo).toEqual(sessaoBase);
        });

        it("deve propagar erro do servico", async () => {
            servico.buscar.mockRejectedValue(new Error("SESSAO_NAO_ENCONTRADA"));
            const req = {
                usuarioId: "usuario1",
                params: { id: "inexistente" }
            };
            const res = criarRes();

            await expect(controller.buscar(req, res)).rejects.toThrow("SESSAO_NAO_ENCONTRADA");
        });
    });

    describe("atualizar", () => {
        it("deve chamar servico.atualizar com id, usuarioId e body e retornar 200", async () => {
            const atualizada = { ...sessaoBase, duracao: 7200 };
            servico.atualizar.mockResolvedValue(atualizada);
            const req = {
                usuarioId: "usuario1",
                params: { id: "sessao1" },
                body: { duracaoSegundos: 7200 },
            };
            const res = criarRes();

            await controller.atualizar(req, res);

            expect(servico.atualizar).toHaveBeenCalledWith("sessao1", "usuario1", { duracaoSegundos: 7200 });
            expect(res.statusCode).toBe(200);
            expect(res.corpo).toEqual(atualizada);
        });

        it("deve propagar erro do servico", async () => {
            servico.atualizar.mockRejectedValue(new Error("SESSAO_NAO_ENCONTRADA"));
            const req = {
                usuarioId: "usuario1",
                params: { id: "sessao1" },
                body: { duracaoSegundos: 7200 },
            };
            const res = criarRes();

            await expect(controller.atualizar(req, res)).rejects.toThrow("SESSAO_NAO_ENCONTRADA");
        });
    });

    describe("deletar", () => {
        it("deve chamar servico.deletar com id e usuarioId e retornar 204", async () => {
            servico.deletar.mockResolvedValue();
            const req = {
                usuarioId: "usuario1",
                params: { id: "sessao1" },
            };
            const res = criarRes();

            await controller.deletar(req, res);

            expect(servico.deletar).toHaveBeenCalledWith("sessao1", "usuario1");
            expect(res.statusCode).toBe(204);
        });

        it("deve propagar erro do servico", async () => {
            servico.deletar.mockRejectedValue(new Error("SESSAO_NAO_ENCONTRADA"));
            const req = {
                usuarioId: "usuario1",
                params: { id: "sessao1" },
            };
            const res = criarRes();

            await expect(controller.deletar(req, res)).rejects.toThrow("SESSAO_NAO_ENCONTRADA");
        });
    });

    describe("somarDuracao", () => {
        it("deve chamar servico.somarDuracao com atividadeId e usuarioId e retornar totalSegundos", async () => {
            servico.somarDuracao.mockResolvedValue(7200);
            const req = {
                usuarioId: "usuario1",
                params: { atividadeId: "atividade1" },
            };

            const res = criarRes();

            await controller.somarDuracao(req, res);

            expect(servico.somarDuracao).toHaveBeenCalledWith("atividade1", "usuario1");
            expect(res.statusCode).toBe(200);
            expect(res.corpo).toEqual({ totalSegundos: 7200 });
        });

    });
});