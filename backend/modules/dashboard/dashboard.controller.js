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
  };
}
