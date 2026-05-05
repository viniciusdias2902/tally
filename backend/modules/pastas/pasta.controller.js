export function criarPastaController(pastaService) {
  return {
    async criar(req, res) {
      const pasta = await pastaService.criar({
        usuarioId: req.usuarioId,
        nome: req.body.nome,
      });
      res.status(201).json(pasta);
    },

    async listar(req, res) {
      const pastas = await pastaService.listar(req.usuarioId);
      res.json(pastas);
    },

    async buscar(req, res) {
      const pasta = await pastaService.buscar(req.params.id, req.usuarioId);
      res.json(pasta);
    },

    async atualizar(req, res) {
      const pasta = await pastaService.atualizar(req.params.id, req.usuarioId, req.body);
      res.json(pasta);
    },

    async deletar(req, res) {
      await pastaService.deletar(req.params.id, req.usuarioId);
      res.status(204).end();
    },
  };
}
