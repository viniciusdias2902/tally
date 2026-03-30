export function criarCategoriaRepository(prisma) {
  return {
    criar({ atividadeId, nome, cor, ordem }) {
      return prisma.categoria.create({ data: { atividadeId, nome, cor, ordem } });
    },

    listarPorAtividade(atividadeId, { incluirArquivadas = false } = {}) {
      return prisma.categoria.findMany({
        where: {
          atividadeId,
          ...(incluirArquivadas ? {} : { arquivada: false }),
        },
        orderBy: { ordem: "asc" },
      });
    },

    buscarPorId(id) {
      return prisma.categoria.findUnique({ where: { id } });
    },

    atualizar(id, dados) {
      return prisma.categoria.update({ where: { id }, data: dados });
    },

    arquivar(id) {
      return prisma.categoria.update({ where: { id }, data: { arquivada: true } });
    },

    desarquivar(id) {
      return prisma.categoria.update({ where: { id }, data: { arquivada: false } });
    },

    deletar(id) {
      return prisma.categoria.delete({ where: { id } });
    },

    possuiSessoes(id) {
      return prisma.sessao.count({ where: { categoriaId: id } })
        .then((total) => total > 0);
    },

    contarPorAtividade(atividadeId) {
      return prisma.categoria.count({ where: { atividadeId } });
    },

    atualizarOrdem(updates) {
      return prisma.$transaction(
        updates.map(({ id, ordem }) =>
          prisma.categoria.update({ where: { id }, data: { ordem } })
        )
      );
    },

  };
}