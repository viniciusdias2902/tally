import { api } from "./client.js";

export function registrar({ nome, email, senha }) {
  return api("/auth/registrar", { body: { nome, email, senha } });
}

export function login({ email, senha }) {
  return api("/auth/login", { body: { email, senha } });
}

export function refresh(refreshToken) {
  return api("/auth/refresh", { body: { refreshToken } });
}

export function logout(refreshToken) {
  return api("/auth/logout", { body: { refreshToken } });
}
