import { ErroApp } from "../lib/ErroApp.js";

export function tratarErro(err, _req, res, _next) {
  if (err instanceof ErroApp) {
    const resposta = { erro: err.message };
    if (err.erros) resposta.erros = err.erros;
    return res.status(err.codigoStatus).json(resposta);
  }

  console.error(err);
  res.status(500).json({ erro: "ERRO_INTERNO" });
}
