import { api } from "./client.js";

export function listar(incluirArquivadas = false) {
  const query = incluirArquivadas ? "?incluirArquivadas=true" : "";
  return api(`/atividades${query}`);
}

export function buscar(id) {
  return api(`/atividades/${id}`);
}

export function criar({ nome, tipoMedicao }) {
  return api("/atividades", { body: { nome, tipoMedicao } });
}

export function atualizar(id, { nome }) {
  return api(`/atividades/${id}`, { method: "PATCH", body: { nome } });
}

export function arquivar(id) {
  return api(`/atividades/${id}/arquivar`, { method: "PATCH" });
}

export function deletar(id) {
  return api(`/atividades/${id}`, { method: "DELETE" });
}
