import { Prisma } from "../generated/prisma/client.ts";
import { ErroApp } from "../lib/ErroApp.js";

function tratarErroPrisma(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return { codigoStatus: 409, erro: "REGISTRO_DUPLICADO", campos: err.meta?.target };
      case "P2025":
        return { codigoStatus: 404, erro: "REGISTRO_NAO_ENCONTRADO" };
      case "P2003":
        return { codigoStatus: 400, erro: "REFERENCIA_INVALIDA", campo: err.meta?.field_name };
      case "P2014":
        return { codigoStatus: 400, erro: "VIOLACAO_RELACAO" };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return { codigoStatus: 400, erro: "DADOS_INVALIDOS" };
  }

  return null;
}

export function tratarErro(err, _req, res, _next) {
  if (err instanceof ErroApp) {
    const resposta = { erro: err.message };
    if (err.erros) resposta.erros = err.erros;
    return res.status(err.codigoStatus).json(resposta);
  }

  const erroPrisma = tratarErroPrisma(err);
  if (erroPrisma) {
    const { codigoStatus, ...resposta } = erroPrisma;
    return res.status(codigoStatus).json(resposta);
  }

  console.error(err);
  res.status(500).json({ erro: "ERRO_INTERNO" });
}
