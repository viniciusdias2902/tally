export function criarDashboardController(dashboardService) {
  return {
    async heatmap(req, res) {
      const dados = await dashboardService.gerarHeatmap({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
        desdeDias: req.query.desdeDias,
      });
      res.json(dados);
    },

    async kpis(req, res) {
      const dados = await dashboardService.obterKpis({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
      });
      res.json(dados);
    },

    async distribuicao(req, res) {
      const dados = await dashboardService.obterDistribuicao({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
      });
      res.json(dados);
    },

    async evolucao(req, res) {
      const dados = await dashboardService.obterEvolucao({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
        dias: req.query.dias,
      });
      res.json(dados);
    },

    async porHora(req, res) {
      const dados = await dashboardService.obterPorHora({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
      });
      res.json(dados);
    },

    async porDiaSemana(req, res) {
      const dados = await dashboardService.obterPorDiaSemana({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
      });
      res.json(dados);
    },

    async porModo(req, res) {
      const dados = await dashboardService.obterPorModo({
        usuarioId: req.usuarioId,
        pastaId: req.query.pastaId,
        atividadeId: req.query.atividadeId,
      });
      res.json(dados);
    },
  };
}
