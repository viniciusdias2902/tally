import { api } from "./client.js";

export function listar(atividadeId, { categoriaId, cursor, limite } = {}) {
  const params = new URLSearchParams();
  if (categoriaId) params.set("categoriaId", categoriaId);
  if (cursor) params.set("cursor", cursor);
  if (limite) params.set("limite", String(limite));
  const query = params.toString();
  return api(
    `/atividades/${atividadeId}/sessoes${query ? `?${query}` : ""}`,
  );
}

export function buscar(atividadeId, id) {
  return api(`/atividades/${atividadeId}/sessoes/${id}`);
}

export function criar(atividadeId, dados) {
  return api(`/atividades/${atividadeId}/sessoes`, { body: dados });
}

export function atualizar(atividadeId, id, dados) {
  return api(`/atividades/${atividadeId}/sessoes/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export function deletar(atividadeId, id) {
  return api(`/atividades/${atividadeId}/sessoes/${id}`, { method: "DELETE" });
}

export function somarDuracao(atividadeId) {
  return api(`/atividades/${atividadeId}/sessoes/duracao`);
}
