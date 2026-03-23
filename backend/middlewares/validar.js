import { ErroApp } from "../lib/ErroApp.js";

export function validar(schema) {
  return (req, _res, next) => {
    const erros = [];

    for (const campo of ["body", "params", "query"]) {
      if (!schema[campo]) continue;

      const resultado = schema[campo].safeParse(req[campo]);

      if (!resultado.success) {
        for (const erro of resultado.error.issues) {
          erros.push({ campo, caminho: erro.path, mensagem: erro.message });
        }
      } else {
        Object.defineProperty(req, campo, {
          value: resultado.data,
          writable: true,
          configurable: true,
        });
      }
    }

    if (erros.length > 0) {
      const erro = new ErroApp("VALIDACAO_FALHOU", 400);
      erro.erros = erros;
      throw erro;
    }

    next();
  };
}
