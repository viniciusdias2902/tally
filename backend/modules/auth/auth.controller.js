export function criarAuthController(authServico) {
  return {
    async registrar(req, res) {
      const tokens = await authServico.registrar(req.body);
      res.status(201).json(tokens);
    },

    async login(req, res) {
      const tokens = await authServico.login(req.body);
      res.json(tokens);
    },

    async refresh(req, res) {
      const tokens = await authServico.refresh(req.body.refreshToken);
      res.json(tokens);
    },

    async logout(req, res) {
      await authServico.logout(req.usuarioId);
      res.status(204).end();
    },
  };
}
