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
            const dados = { atividadeId: "a1", nome: "Categoria Teste", cor: "#FF0000", ordem: 0 };
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
            const categorias = [{ id: "c1", nome: "Categoria Teste" }];
            prisma.categoria.findMany.mockResolvedValue(categorias);

            const resultado = await repositorio.listarPorAtividade("a1");

            expect(resultado).toEqual(categorias);
        });
    });

    describe("buscarPorId", () => {
        it("deve buscar uma categoria por id", async () => {
            const categoria = { id: "c1", nome: "Categoria Teste" };
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

    describe("atualizar", () => {
        it("deve atualizar uma categoria por id", async () => {
            const categoria = { id: "c1", nome: "Categoria Atualizada" };
            prisma.categoria.update.mockResolvedValue(categoria);

            const resultado = await repositorio.atualizar("c1", { nome: "Categoria Atualizada" });

            expect(prisma.categoria.update).toHaveBeenCalledWith({ where: { id: "c1" }, data: { nome: "Categoria Atualizada" } });
            expect(resultado).toEqual(categoria);
        });
    });

    describe("arquivar", () => {
        it("arquiva uma categoria por id", async () => {
            const categoria = { id: "c1", arquivada: true };
            prisma.categoria.update.mockResolvedValue(categoria);

            const resultado = await repositorio.arquivar("c1");

            expect(prisma.categoria.update).toHaveBeenCalledWith({ where: { id: "c1" }, data: { arquivada: true } });
            expect(resultado).toEqual(categoria);
        });
    });

    describe("desarquivar", () => {
        it("desarquiva uma categoria por id", async () => {
            const categoria = { id: "c1", arquivada: false };
            prisma.categoria.update.mockResolvedValue(categoria);

            const resultado = await repositorio.desarquivar("c1");

            expect(prisma.categoria.update).toHaveBeenCalledWith({ where: { id: "c1" }, data: { arquivada: false } });
            expect(resultado).toEqual(categoria);
        });
    });

    describe("excluir", () => {
        it("exclui uma categoria por id", async () => {
            const categoria = { id: "c1" };
            prisma.categoria.delete.mockResolvedValue(categoria);

            const resultado = await repositorio.deletar("c1");

            expect(prisma.categoria.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
            expect(resultado).toEqual(categoria);
        });
    });

    describe("possuiSessoes", () => {
        it("retorna true se a categoria tiver sessoes", async () => {
            prisma.sessao.count.mockResolvedValue(1);

            const resultado = await repositorio.possuiSessoes("c1");

            expect(prisma.sessao.count).toHaveBeenCalledWith({ where: { categoriaId: "c1" } });
            expect(resultado).toBe(true);
        });
        it("retorna false se a categoria não tiver sessoes", async () => {
            prisma.sessao.count.mockResolvedValue(0);

            const resultado = await repositorio.possuiSessoes("c1");

            expect(prisma.sessao.count).toHaveBeenCalledWith({ where: { categoriaId: "c1" } });
            expect(resultado).toBe(false);
        });
    });
})

