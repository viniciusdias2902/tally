export function criarAtividadeRepository(prisma) {
    return {
        criar({ nome, usuarioId }) {
            return prisma.atividade.create({ data: { nome, usuarioId } });
        },

        buscarPorId(id) {
            return prisma.atividade.findUnique({ where: { id } });
        },
    };
}


