export function criarSessaoRepository(prisma) {
    return {
        criar({ atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes }) {
            return prisma.sessao.create({
                data: { atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes },
            });
        },

