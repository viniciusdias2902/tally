import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoRepository } from "../sessao.repository";

function criarPrismaMock() {
    return {
        sessao: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn()
        },
    };
}

