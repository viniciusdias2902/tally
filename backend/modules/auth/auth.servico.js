import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ErroApp } from "../../lib/ErroApp.js";

const RODADAS_SALT = 12;

export function criarAuthServico(usuarioRepositorio) {
  const {
    JWT_SECRET,
    JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN,
  } = process.env;

  function gerarAccessToken(usuarioId) {
    return jwt.sign({ sub: usuarioId }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  function gerarRefreshToken(usuarioId) {
    return jwt.sign({ sub: usuarioId }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  return {
    async registrar({ email, nome, senha }) {
      const existente = await usuarioRepositorio.buscarPorEmail(email);
      if (existente) throw new ErroApp("EMAIL_JA_EXISTE", 409);

      const senhaHash = await bcrypt.hash(senha, RODADAS_SALT);
      const usuario = await usuarioRepositorio.criar({ email, nome, senhaHash });

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepositorio.atualizarRefreshToken(usuario.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async login({ email, senha }) {
      const usuario = await usuarioRepositorio.buscarPorEmail(email);
      if (!usuario) throw new ErroApp("CREDENCIAIS_INVALIDAS", 401);

      const corresponde = await bcrypt.compare(senha, usuario.senhaHash);
      if (!corresponde) throw new ErroApp("CREDENCIAIS_INVALIDAS", 401);

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepositorio.atualizarRefreshToken(usuario.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async refresh(token) {
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        throw new ErroApp("REFRESH_TOKEN_INVALIDO", 401);
      }

      const usuario = await usuarioRepositorio.buscarPorId(payload.sub);
      if (!usuario || usuario.refreshToken !== token) {
        throw new ErroApp("REFRESH_TOKEN_INVALIDO", 401);
      }

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepositorio.atualizarRefreshToken(usuario.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async logout(usuarioId) {
      await usuarioRepositorio.atualizarRefreshToken(usuarioId, null);
    },
  };
}
