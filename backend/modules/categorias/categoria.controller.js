export function criarCategoriaController(categoriaService) {
  return {
    async criar(req, res) {
      const categoria = await categoriaService.criar({
        atividadeId: req.params.atividadeId,
        usuarioId: req.usuarioId,
        nome: req.body.nome,
        cor: req.body.cor,
      });
      res.status(201).json(categoria);
    },

    async listar(req, res) {
      const incluirArquivadas = req.query.incluirArquivadas === "true";
      const categorias = await categoriaService.listar(
        req.params.atividadeId,
        req.usuarioId,
        { incluirArquivadas },
      );
      res.json(categorias);
    },

    async buscar(req, res) {
      const categoria = await categoriaService.buscar(req.params.id, req.usuarioId);
      res.json(categoria);
    },

    async atualizar(req, res) {
      const categoria = await categoriaService.atualizar(req.params.id, req.usuarioId, req.body);
      res.json(categoria);
    },

    async arquivar(req, res) {
      await categoriaService.arquivar(req.params.id, req.usuarioId);
      res.status(204).end();
    },

    async desarquivar(req, res) {
      await categoriaService.desarquivar(req.params.id, req.usuarioId);
      res.status(204).end();
    },

    async deletar(req, res) {
      await categoriaService.deletar(req.params.id, req.usuarioId);
      res.status(204).end();
    },

    async reordenar(req, res) {
      await categoriaService.reordenar(req.params.atividadeId, req.usuarioId, req.body.ordenacoes);
      res.status(204).end();
    },
  };
}
