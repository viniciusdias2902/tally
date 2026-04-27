import { api } from "./client.js";

export function listar(atividadeId, incluirArquivadas = false) {
  const query = incluirArquivadas ? "?incluirArquivadas=true" : "";
  return api(`/atividades/${atividadeId}/categorias${query}`);
}

export function criar(atividadeId, { nome, cor }) {
  return api(`/atividades/${atividadeId}/categorias`, { body: { nome, cor } });
}

export function atualizar(atividadeId, id, dados) {
  return api(`/atividades/${atividadeId}/categorias/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export function arquivar(atividadeId, id) {
  return api(`/atividades/${atividadeId}/categorias/${id}/arquivar`, {
    method: "PATCH",
  });
}

export function desarquivar(atividadeId, id) {
  return api(`/atividades/${atividadeId}/categorias/${id}/desarquivar`, {
    method: "PATCH",
  });
}

export function deletar(atividadeId, id) {
  return api(`/atividades/${atividadeId}/categorias/${id}`, { method: "DELETE" });
}
