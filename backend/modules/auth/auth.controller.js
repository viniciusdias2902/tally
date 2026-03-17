export function criarAuthController(authService) {
  return {
    async registrar(req, res) {
      const tokens = await authService.registrar(req.body);
      res.status(201).json(tokens);
    },

    async login(req, res) {
      const tokens = await authService.login(req.body);
      res.json(tokens);
    },

    async refresh(req, res) {
      const tokens = await authService.refresh(req.body.refreshToken);
      res.json(tokens);
    },

    async logout(req, res) {
      await authService.logout(req.usuarioId);
      res.status(204).end();
    },
  };
}
