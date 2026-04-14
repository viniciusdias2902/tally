export function criarSessaoController(sessaoService) {
  return {
    async criar(req, res) {
      const sessao = await sessaoService.criar({
        atividadeId: req.params.atividadeId,
        usuarioId: req.usuarioId,
        categoriaId: req.body.categoriaId,
        iniciadoEm: req.body.iniciadoEm,
        duracaoSegundos: req.body.duracaoSegundos,
        modo: req.body.modo,
        ciclosPomodoro: req.body.ciclosPomodoro,
        observacoes: req.body.observacoes,
      });
      res.status(201).json(sessao);
    },

    async listar(req, res) {
      const sessoes = await sessaoService.listar(
        req.params.atividadeId,
        req.usuarioId,
        req.query,
      );
      res.json(sessoes);
    },

    async buscar(req, res) {
      const sessao = await sessaoService.buscar(req.params.id, req.usuarioId);
      res.json(sessao);
    },

    async atualizar(req, res) {
      const sessao = await sessaoService.atualizar(req.params.id, req.usuarioId, req.body);
      res.json(sessao);
    },

    async deletar(req, res) {
      await sessaoService.deletar(req.params.id, req.usuarioId);
      res.status(204).end();
    },

    async somarDuracao(req, res) {
      const total = await sessaoService.somarDuracao(
        req.params.atividadeId,
        req.usuarioId,
      );
      res.json({ totalSegundos: total });
    },
  };
}
