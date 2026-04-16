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
