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
    });
});