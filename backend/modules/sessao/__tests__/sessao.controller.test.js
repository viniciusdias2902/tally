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