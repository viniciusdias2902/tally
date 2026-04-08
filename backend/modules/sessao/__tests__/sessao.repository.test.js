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
});
