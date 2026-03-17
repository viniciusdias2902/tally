export function criarUsuarioRepository(prisma) {
  return {
    buscarPorEmail(email) {
      return prisma.usuario.findUnique({ where: { email } });
    },

    criar({ email, nome, senhaHash }) {
      return prisma.usuario.create({ data: { email, nome, senhaHash } });
    },

    atualizarRefreshToken(id, refreshToken) {
      return prisma.usuario.update({ where: { id }, data: { refreshToken } });
    },

    buscarPorId(id) {
      return prisma.usuario.findUnique({ where: { id } });
    },
  };
}
