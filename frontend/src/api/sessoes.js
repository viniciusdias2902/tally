import { api } from "./client.js";

export function criar(atividadeId, { categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro }) {
  return api(`/atividades/${atividadeId}/sessoes`, {
    body: { categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro },
  });
}

export function listar(atividadeId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const qs = query ? `?${query}` : "";
  return api(`/atividades/${atividadeId}/sessoes${qs}`);
}
