export function criarConfigPomodoroRepository(prisma) {
  return {
    buscarPorAtividade(atividadeId) {
      return prisma.configPomodoro.findUnique({ where: { atividadeId } });
    },

    upsert({ atividadeId, minutosFoco, minutosPausaCurta, minutosPausaLonga, ciclosAntesLonga }) {
      const dados = { minutosFoco, minutosPausaCurta, minutosPausaLonga, ciclosAntesLonga };
      return prisma.configPomodoro.upsert({
        where: { atividadeId },
        create: { atividadeId, ...dados },
        update: dados,
      });
    },

    deletarPorAtividade(atividadeId) {
      return prisma.configPomodoro.delete({ where: { atividadeId } });
    },
  };
}
