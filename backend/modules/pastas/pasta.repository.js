export function criarPastaRepository(prisma) {
  return {
    criar({ usuarioId, nome, ordem }) {
      return prisma.pasta.create({ data: { usuarioId, nome, ordem } });
    },

    listarPorUsuario(usuarioId) {
      return prisma.pasta.findMany({
        where: { usuarioId },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });
    },

    buscarPorId(id) {
      return prisma.pasta.findUnique({ where: { id } });
    },

    atualizar(id, dados) {
      return prisma.pasta.update({ where: { id }, data: dados });
    },

    deletar(id) {
      return prisma.pasta.delete({ where: { id } });
    },

    contarPorUsuario(usuarioId) {
      return prisma.pasta.count({ where: { usuarioId } });
    },
  };
}
