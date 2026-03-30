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

    describe("listarPorAtividade", () => {
        it("deve filtrar por atividadeId e excluir arquivadas por padrão", async () => {
            prisma.categoria.findMany.mockResolvedValue([]);

            await repositorio.listarPorAtividade("a1");


            expect(prisma.categoria.findMany).toHaveBeenCalledWith({
                where: { atividadeId: "a1", arquivada: false },
                orderBy: { ordem: "asc" },
            });
        });

        it("deve incluir arquivadas quando solicitado", async () => {
            prisma.categoria.findMany.mockResolvedValue([]);

            await repositorio.listarPorAtividade("a1", { incluirArquivadas: true });

            expect(prisma.categoria.findMany).toHaveBeenCalledWith({
                where: { atividadeId: "a1" },
                orderBy: { ordem: "asc" },
            });
        });

        it("deve retornar as categorias encontradas", async () => {
            const categorias = [{ id: "c1", nome: "Fixação" }];
            prisma.categoria.findMany.mockResolvedValue(categorias);

            const resultado = await repositorio.listarPorAtividade("a1");

            expect(resultado).toEqual(categorias);
        });
    });

    describe("buscarPorId", () => {
        it("deve buscar uma categoria por id", async () => {
            const categoria = { id: "c1", nome: "Fixação" };
            prisma.categoria.findUnique.mockResolvedValue(categoria);

            const resultado = await repositorio.buscarPorId("c1");

            expect(prisma.categoria.findUnique).toHaveBeenCalledWith({ where: { id: "c1" } });
            expect(resultado).toEqual(categoria);
        });
        it("deve retornar null quando não encontrar", async () => {
            prisma.categoria.findUnique.mockResolvedValue(null);

            const resultado = await repositorio.buscarPorId("c1");

            expect(prisma.categoria.findUnique).toHaveBeenCalledWith({ where: { id: "c1" } });
            expect(resultado).toBeNull();
        });
    });
})

