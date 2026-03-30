export function criarAtividadeController(atividadeService) {
  return {
    async criar(req, res) {
      const atividade = await atividadeService.criar({
        usuarioId: req.usuarioId,
        nome: req.body.nome,
        tipoMedicao: req.body.tipoMedicao,
      });
      res.status(201).json(atividade);
    },

    async listar(req, res) {
      const incluirArquivadas = req.query.incluirArquivadas === "true";
      const atividades = await atividadeService.listar(req.usuarioId, { incluirArquivadas });
      res.json(atividades);
    },

    async buscar(req, res) {
      const atividade = await atividadeService.buscar(req.params.id, req.usuarioId);
      res.json(atividade);
    },

    async atualizar(req, res) {
      const atividade = await atividadeService.atualizar(req.params.id, req.usuarioId, req.body);
      res.json(atividade);
    },

    async arquivar(req, res) {
      await atividadeService.arquivar(req.params.id, req.usuarioId);
      res.status(204).end();
    },

    async deletar(req, res) {
      await atividadeService.deletar(req.params.id, req.usuarioId);
      res.status(204).end();
    },
  };
}
