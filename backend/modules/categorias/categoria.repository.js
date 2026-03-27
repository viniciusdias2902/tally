export function criarCategoriaRepository(prisma) {
  return {
    criar({ atividadeId, nome, cor, ordem }) {
      return prisma.categoria.create({ data: { atividadeId, nome, cor, ordem } });
    },

