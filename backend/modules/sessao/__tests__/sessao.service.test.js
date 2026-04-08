import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoService } from "../sessao.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

function criarRepositorioMock() {
    return {
        criar: vi.fn(),
        listarPorAtividade: vi.fn(),
        buscarPorId: vi.fn(),
        atualizar: vi.fn(),
        deletar: vi.fn(),
        somarDuracaoPorAtividade: vi.fn(),
    };
}

function criarAtividadeServiceMock() {
    return {
        buscar: vi.fn(),
    }
}

function criarCategoriaServiceMock() {
    return {
        buscar: vi.fn(),
    }
}

const atividadeBase = {
    id: "atividade1",
    usuarioId: "usuario1",
    nome: "Estudos",
    tipoMedicao: "cronometrada",
    arquivada: false,
};

const categoriaBase = {
    id: "categoria1",
    usuarioId: "usuario1",
    nome: "Estudos",
    arquivada: false,
};