import { describe, it, expect, vi, beforeEach } from "vitest";
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

    describe("criar", () => {
        it("deve chamar create com os dados corretos", async () => {
            const dados = { atividadeId: "a1", nome: "Fixação", cor: "#FF0000", ordem: 0 };
            const categoria = { id: "c1", ...dados, arquivada: false };

            prisma.categoria.create.mockResolvedValue(categoria);

            const resultado = await repositorio.criar(dados);

            expect(prisma.categoria.create).toHaveBeenCalledWith({ data: dados });
            expect(resultado).toEqual(categoria);
        });
    });
})

