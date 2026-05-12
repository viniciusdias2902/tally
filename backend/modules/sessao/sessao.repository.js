export function criarSessaoRepository(prisma) {
  return {
    criar({ atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes }) {
      return prisma.sessao.create({
        data: { atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes },
      });
    },

    async listarPorAtividade(atividadeId, { categoriaId, pagina = 1, limite = 20 } = {}) {
      const where = {
        atividadeId,
        ...(categoriaId ? { categoriaId } : {}),
      };
      const [items, total] = await Promise.all([
        prisma.sessao.findMany({
          where,
          orderBy: { iniciadoEm: "desc" },
          take: limite,
          skip: (pagina - 1) * limite,
          include: { categoria: true },
        }),
        prisma.sessao.count({ where }),
      ]);
      return { items, total };
    },

    buscarPorId(id) {
      return prisma.sessao.findUnique({
        where: { id },
        include: { categoria: true },
      });
    },

    atualizar(id, dados) {
      return prisma.sessao.update({ where: { id }, data: dados });
    },

    deletar(id) {
      return prisma.sessao.delete({ where: { id } });
    },

    contarPorAtividade(atividadeId) {
      return prisma.sessao.count({ where: { atividadeId } });
    },

    contarPorCategoria(categoriaId) {
      return prisma.sessao.count({ where: { categoriaId } });
    },

    somarDuracaoPorAtividade(atividadeId) {
      return prisma.sessao.aggregate({
        where: { atividadeId },
        _sum: { duracaoSegundos: true },
      });
    },
  };
}
