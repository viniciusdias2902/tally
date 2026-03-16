export function createUserRepository(prisma) {
  return {
    findByEmail(email) {
      return prisma.usuario.findUnique({ where: { email } });
    },

    create({ email, nome, senhaHash }) {
      return prisma.usuario.create({ data: { email, nome, senhaHash } });
    },

    updateRefreshToken(id, refreshToken) {
      return prisma.usuario.update({ where: { id }, data: { refreshToken } });
    },

    findById(id) {
      return prisma.usuario.findUnique({ where: { id } });
    },
  };
}
