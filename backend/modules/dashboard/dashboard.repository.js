const UM_DIA_MS = 86400000;

function chaveData(data) {
  return data.toISOString().slice(0, 10);
}

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

    async calcularStreaks({
      usuarioId,
      pastaId = null,
      atividadeId = null,
      agora = new Date(),
    }) {
      const linhas = await prisma.$queryRaw`
        SELECT DISTINCT (s.iniciado_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia
        FROM sessoes s
        JOIN atividades a ON a.id = s.atividade_id
        WHERE a.usuario_id = ${usuarioId}::uuid
          AND (${pastaId}::uuid IS NULL OR a.pasta_id = ${pastaId}::uuid)
          AND (${atividadeId}::uuid IS NULL OR s.atividade_id = ${atividadeId}::uuid)
        ORDER BY dia ASC
      `;

      const dias = linhas.map((linha) => chaveData(linha.dia));
      if (dias.length === 0) {
        return { streakAtual: 0, melhorStreak: 0 };
      }

      let melhorStreak = 1;
      let temp = 1;
      for (let i = 1; i < dias.length; i++) {
        const diff = (new Date(dias[i]) - new Date(dias[i - 1])) / UM_DIA_MS;
        if (diff === 1) {
          temp++;
          if (temp > melhorStreak) melhorStreak = temp;
        } else {
          temp = 1;
        }
      }

      const hoje = new Date(agora);
      hoje.setUTCHours(0, 0, 0, 0);
      const ontem = new Date(hoje);
      ontem.setUTCDate(ontem.getUTCDate() - 1);
      const ultimoDia = dias[dias.length - 1];

      let streakAtual = 0;
      if (ultimoDia === chaveData(hoje) || ultimoDia === chaveData(ontem)) {
        streakAtual = 1;
        for (let i = dias.length - 2; i >= 0; i--) {
          const diff = (new Date(dias[i + 1]) - new Date(dias[i])) / UM_DIA_MS;
          if (diff === 1) {
            streakAtual++;
          } else {
            break;
          }
        }
      }

      return { streakAtual, melhorStreak };
    },
  };
}
