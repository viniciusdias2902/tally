import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ErroApp } from "../../lib/ErroApp.js";

const RODADAS_SALT = 12;

export function criarAuthService(usuarioRepository) {
  const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN,
  } = process.env;

  function gerarAccessToken(usuarioId) {
    return jwt.sign({ sub: usuarioId }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  function gerarRefreshToken(usuarioId) {
    return jwt.sign({ sub: usuarioId, jti: crypto.randomUUID() }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  return {
    async registrar({ email, nome, senha }) {
      const existente = await usuarioRepository.buscarPorEmail(email);
      if (existente) throw new ErroApp("EMAIL_JA_EXISTE", 409);

      const senhaHash = await bcrypt.hash(senha, RODADAS_SALT);
      const usuario = await usuarioRepository.criar({ email, nome, senhaHash });

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepository.atualizarRefreshToken(usuario.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      };
    },

    async login({ email, senha }) {
      const usuario = await usuarioRepository.buscarPorEmail(email);
      if (!usuario) throw new ErroApp("CREDENCIAIS_INVALIDAS", 401);

      const corresponde = await bcrypt.compare(senha, usuario.senhaHash);
      if (!corresponde) throw new ErroApp("CREDENCIAIS_INVALIDAS", 401);

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepository.atualizarRefreshToken(usuario.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      };
    },

    async refresh(token) {
      let payload;
      try {
        payload = jwt.verify(token, JWT_REFRESH_SECRET);
      } catch {
        throw new ErroApp("REFRESH_TOKEN_INVALIDO", 401);
      }

      const usuario = await usuarioRepository.buscarPorId(payload.sub);
      if (!usuario || usuario.refreshToken !== token) {
        throw new ErroApp("REFRESH_TOKEN_INVALIDO", 401);
      }

      const accessToken = gerarAccessToken(usuario.id);
      const refreshToken = gerarRefreshToken(usuario.id);
      await usuarioRepository.atualizarRefreshToken(usuario.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      };
    },

    async logout(usuarioId) {
      await usuarioRepository.atualizarRefreshToken(usuarioId, null);
    },
  };
}
