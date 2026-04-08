import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarSessaoRepository } from "../sessao.repository";
import { _includes } from "zod/v4/core";

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

describe("Sessao Repository", () => {
    let prismaMock;
    let sessaoRepository;

    beforeEach(() => {
        prismaMock = criarPrismaMock();
        sessaoRepository = criarSessaoRepository(prismaMock);
    });

    it("deve criar uma noca sessão", async () => {
        const dadosSessao = {
            atividadeId: 1,
            categoriaId: 1,
            iniciadoEm: new Date(),
            duracaoSegundos: 3600,
            modo: "foco",
            ciclosPomodoro: 4,
            observacoes: "Sessão de estudo",
        };
        const sessaoCriada = { ...dadosSessao, id: 1 };
        prismaMock.sessao.create.mockResolvedValue(sessaoCriada);

        const resultado = await sessaoRepository.criar(dadosSessao);

        expect(prismaMock.sessao.create).toHaveBeenCalledWith({ data: dadosSessao });
        expect(resultado).toEqual(sessaoCriada);

    });

    it("deve listar todas as sessões por atividade", async () => {
        const sessoes = [
            { id: 1, atividadeId: 1, categoriaId: 1, iniciadoEm: new Date(), duracaoSegundos: 3600 },
            { id: 2, atividadeId: 1, categoriaId: 2, iniciadoEm: new Date(), duracaoSegundos: 1800 },
        ];
        prismaMock.sessao.findMany.mockResolvedValue(sessoes);

        const resultado = await sessaoRepository.listarPorAtividade(1, { categoriaId: 1 });

        expect(prismaMock.sessao.findMany).toHaveBeenCalledWith({
            where: { atividadeId: 1, categoriaId: 1 },
            orderBy: { iniciadoEm: "desc" },
            take: 20,
            include: { categoria: true },
        });
        expect(resultado).toEqual(sessoes);
    });
});
