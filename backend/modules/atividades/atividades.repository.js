export function criarAtividadeRepository(prisma) {
    return {
        criar({ nome, usuarioId }) {
            return prisma.atividade.create({ data: { nome, usuarioId } })
        },

    }
}