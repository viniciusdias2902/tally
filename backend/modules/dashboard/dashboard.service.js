function formatarData(data) {
  return data.toISOString().slice(0, 10);
}

export function criarDashboardService(dashboardRepository) {
  return {
    async gerarHeatmap({
      usuarioId,
      pastaId = null,
      atividadeId = null,
    }) {
      const anoAtual = new Date().getFullYear();
      const dataInicio = new Date(Date.UTC(anoAtual, 0, 1));
      const dataFim = new Date(Date.UTC(anoAtual + 1, 0, 1));

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
      while (cursor < dataFim) {
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

    async obterEvolucao({
      usuarioId,
      pastaId = null,
      atividadeId = null,
      dias = 30,
      agora = new Date(),
    }) {
      const hoje = new Date(agora);
      hoje.setUTCHours(0, 0, 0, 0);

      const dataFim = new Date(hoje);
      dataFim.setUTCDate(dataFim.getUTCDate() + 1);

      const dataInicio = new Date(hoje);
      dataInicio.setUTCDate(dataInicio.getUTCDate() - (dias - 1));

      const linhas = await dashboardRepository.somarSegundosPorDia({
        usuarioId,
        pastaId,
        atividadeId,
        dataInicio,
        dataFim,
      });

      const mapa = new Map();
      for (const linha of linhas) {
        mapa.set(formatarData(linha.dia), linha.totalSegundos);
      }

      const resultado = [];
      const cursor = new Date(dataInicio);
      for (let i = 0; i < dias; i++) {
        const chave = formatarData(cursor);
        resultado.push({ data: chave, totalSegundos: mapa.get(chave) ?? 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      return resultado;
    },

    async obterPorHora({ usuarioId, pastaId = null, atividadeId = null }) {
      return dashboardRepository.somarPorHoraDoDia({ usuarioId, pastaId, atividadeId });
    },

    async obterPorDiaSemana({ usuarioId, pastaId = null, atividadeId = null }) {
      return dashboardRepository.somarPorDiaDaSemana({ usuarioId, pastaId, atividadeId });
    },

    async obterPorModo({ usuarioId, pastaId = null, atividadeId = null }) {
      return dashboardRepository.somarPorModo({ usuarioId, pastaId, atividadeId });
    },

    async obterTopAtividades({ usuarioId, limite = 8 }) {
      return dashboardRepository.topAtividadesDoUsuario({ usuarioId, limite });
    },

    async obterDistribuicao({ usuarioId, pastaId = null, atividadeId = null }) {
      if (atividadeId) {
        const itens = await dashboardRepository.somarPorCategoriaNaAtividade({
          usuarioId,
          atividadeId,
        });
        return { nivel: "categoria", itens };
      }
      if (pastaId) {
        const itens = await dashboardRepository.somarPorAtividadeNaPasta({
          usuarioId,
          pastaId,
        });
        return { nivel: "atividade", itens };
      }
      const itens = await dashboardRepository.somarPorPastaDoUsuario({ usuarioId });
      return { nivel: "pasta", itens };
    },
  };
}
