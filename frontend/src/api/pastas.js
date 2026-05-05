import { api } from "./client.js";

export function listar() {
  return api("/pastas");
}

export function buscar(id) {
  return api(`/pastas/${id}`);
}

export function criar({ nome }) {
  return api("/pastas", { body: { nome } });
}

export function atualizar(id, dados) {
  return api(`/pastas/${id}`, { method: "PATCH", body: dados });
}

export function deletar(id) {
  return api(`/pastas/${id}`, { method: "DELETE" });
}
