function formatarData(data) {
  return data.toISOString().slice(0, 10);
}

export function criarDashboardService(dashboardRepository) {
  return {
    async gerarHeatmap({
      usuarioId,
      pastaId = null,
      atividadeId = null,
      desdeDias = 365,
      agora = new Date(),
    }) {
      const hoje = new Date(agora);
      hoje.setUTCHours(0, 0, 0, 0);

      const dataFim = new Date(hoje);
      dataFim.setUTCDate(dataFim.getUTCDate() + 1);

      const dataInicio = new Date(hoje);
      dataInicio.setUTCDate(dataInicio.getUTCDate() - (desdeDias - 1));

      const linhas = await dashboardRepository.somarSegundosPorDia({
        usuarioId,
        pastaId,
        atividadeId,
        dataInicio,
        dataFim,
      });

      const mapaDias = new Map();
      for (const linha of linhas) {
        const chave = formatarData(linha.dia);
        mapaDias.set(chave, Math.round(linha.totalSegundos / 60));
      }

      const resultado = [];
      const cursor = new Date(dataInicio);
      for (let i = 0; i < desdeDias; i++) {
        const chave = formatarData(cursor);
        resultado.push({ date: chave, count: mapaDias.get(chave) ?? 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      return resultado;
    },

    async obterKpis({
      usuarioId,
      pastaId = null,
      atividadeId = null,
      agora = new Date(),
    }) {
      const [totais, streaks] = await Promise.all([
        dashboardRepository.somarTotaisGerais({ usuarioId, pastaId, atividadeId }),
        dashboardRepository.calcularStreaks({ usuarioId, pastaId, atividadeId, agora }),
      ]);
      return { ...totais, ...streaks };
    },
  };
}
