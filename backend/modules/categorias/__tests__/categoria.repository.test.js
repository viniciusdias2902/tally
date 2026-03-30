import { describe, expect, vi, beforeEach } from "vitest";
import { criarCategoriaRepository } from "../categoria.repository";

function criarPrismaMock() {
    return {
        categoria: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn()
        },
        sessao: {
            count: vi.fn(),
        },
        $transaction: vi.fn(),
    };
}

describe("categoria.repository", () => {
    let prisma;
    let repositorio;

    beforeEach(() => {
        prisma = criarPrismaMock();
        repositorio = criarCategoriaRepository(prisma);
    });
});
