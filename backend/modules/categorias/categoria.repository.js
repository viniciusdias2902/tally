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

