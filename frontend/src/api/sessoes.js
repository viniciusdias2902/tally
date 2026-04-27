import { api } from "./client.js";

export function criar(atividadeId, { categoriaId, iniciadoEm, duracaoSegundos, modo }) {
  return api(`/atividades/${atividadeId}/sessoes`, {
    body: { categoriaId, iniciadoEm, duracaoSegundos, modo },
  });
}

export function listar(atividadeId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const qs = query ? `?${query}` : "";
  return api(`/atividades/${atividadeId}/sessoes${qs}`);
}
