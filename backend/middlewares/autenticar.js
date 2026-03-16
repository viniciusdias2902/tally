import jwt from "jsonwebtoken";
import { ErroApp } from "../lib/ErroApp.js";

export function autenticar(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ErroApp("TOKEN_NAO_FORNECIDO", 401);
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.sub;
  } catch {
    throw new ErroApp("TOKEN_INVALIDO", 401);
  }

  next();
}
