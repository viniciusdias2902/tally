export function criarAtividadeRepository(prisma) {
  return {
    criar({ usuarioId, nome, tipoMedicao }) {
      return prisma.atividade.create({ data: { usuarioId, nome, tipoMedicao } });
    },

    listarPorUsuario(usuarioId, { incluirArquivadas = false } = {}) {
      return prisma.atividade.findMany({
        where: {
          usuarioId,
          ...(incluirArquivadas ? {} : { arquivada: false }),
        },
        orderBy: { criadoEm: "asc" },
      });
    },

    buscarPorId(id) {
      return prisma.atividade.findUnique({ where: { id } });
    },

    atualizar(id, dados) {
      return prisma.atividade.update({ where: { id }, data: dados });
    },

    arquivar(id) {
      return prisma.atividade.update({ where: { id }, data: { arquivada: true } });
    },

    deletar(id) {
      return prisma.atividade.delete({ where: { id } });
    },

    possuiSessoes(id) {
      return prisma.sessao
        .count({ where: { atividadeId: id } })
        .then((total) => total > 0);
    },

    arquivarCategorias(atividadeId) {
      return prisma.categoria.updateMany({
        where: { atividadeId },
        data: { arquivada: true },
      });
    },
  };
}
