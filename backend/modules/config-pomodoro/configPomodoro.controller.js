export function criarConfigPomodoroController(configPomodoroService) {
  return {
    async buscar(req, res) {
      const config = await configPomodoroService.buscar(
        req.params.atividadeId,
        req.usuarioId,
      );
      res.json(config);
    },

    async upsert(req, res) {
      const config = await configPomodoroService.upsert({
        atividadeId: req.params.atividadeId,
        usuarioId: req.usuarioId,
        ...req.body,
      });
      res.json(config);
    },

    async deletar(req, res) {
      await configPomodoroService.deletar(
        req.params.atividadeId,
        req.usuarioId,
      );
      res.status(204).end();
    },
  };
}
