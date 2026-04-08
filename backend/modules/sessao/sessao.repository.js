export function criarSessaoRepository(prisma) {
    return {
        criar({ atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes }) {
            return prisma.sessao.create({
                data: { atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes },
            });
        },
        listarPorAtividade(atividadeId, { categoriaId, cursor, limite = 20 } = {}) {
            return prisma.sessao.findMany({
                where: {
                    atividadeId,
                    ...(categoriaId ? { categoriaId } : {}),
                },
                orderBy: { iniciadoEm: 'desc' },
                take: limite,
                ...(cursor ? { cursor } : {}),
                include: {
                    categoria: true
                },
            });
        },


