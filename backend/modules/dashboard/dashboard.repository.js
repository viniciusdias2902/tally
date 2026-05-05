export function criarDashboardRepository(prisma) {
  return {
    async somarSegundosPorDia({
      usuarioId,
      pastaId = null,
      atividadeId = null,
      dataInicio,
      dataFim,
    }) {
      const linhas = await prisma.$queryRaw`
        SELECT
          (s.iniciado_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
          SUM(s.duracao_segundos)::int AS total_segundos
        FROM sessoes s
        JOIN atividades a ON a.id = s.atividade_id
        WHERE a.usuario_id = ${usuarioId}::uuid
          AND (${pastaId}::uuid IS NULL OR a.pasta_id = ${pastaId}::uuid)
          AND (${atividadeId}::uuid IS NULL OR s.atividade_id = ${atividadeId}::uuid)
          AND s.iniciado_em >= ${dataInicio}
          AND s.iniciado_em < ${dataFim}
        GROUP BY dia
        ORDER BY dia ASC
      `;
      return linhas.map((linha) => ({
        dia: linha.dia,
        totalSegundos: linha.total_segundos,
      }));
    },

    async somarTotaisGerais({ usuarioId, pastaId = null, atividadeId = null }) {
      const linhas = await prisma.$queryRaw`
        SELECT
          COALESCE(SUM(s.duracao_segundos), 0)::int AS total_segundos,
          COUNT(s.id)::int AS total_sessoes
        FROM sessoes s
        JOIN atividades a ON a.id = s.atividade_id
        WHERE a.usuario_id = ${usuarioId}::uuid
          AND (${pastaId}::uuid IS NULL OR a.pasta_id = ${pastaId}::uuid)
          AND (${atividadeId}::uuid IS NULL OR s.atividade_id = ${atividadeId}::uuid)
      `;
      return {
        totalSegundos: linhas[0].total_segundos,
        totalSessoes: linhas[0].total_sessoes,
      };
    },
  };
}
