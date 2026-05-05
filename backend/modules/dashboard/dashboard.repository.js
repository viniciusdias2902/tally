export function criarDashboardRepository(prisma) {
  return {
    async somarSegundosPorDia({ usuarioId, pastaId = null, dataInicio, dataFim }) {
      const linhas = await prisma.$queryRaw`
        SELECT
          (s.iniciado_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
          SUM(s.duracao_segundos)::int AS total_segundos
        FROM sessoes s
        JOIN atividades a ON a.id = s.atividade_id
        WHERE a.usuario_id = ${usuarioId}::uuid
          AND (${pastaId}::uuid IS NULL OR a.pasta_id = ${pastaId}::uuid)
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
  };
}
