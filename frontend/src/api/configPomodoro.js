import { api } from "./client.js";

export function buscar(atividadeId) {
  return api(`/atividades/${atividadeId}/config-pomodoro`);
}

export function upsert(atividadeId, dados) {
  return api(`/atividades/${atividadeId}/config-pomodoro`, {
    method: "PUT",
    body: dados,
  });
}

export function deletar(atividadeId) {
  return api(`/atividades/${atividadeId}/config-pomodoro`, {
    method: "DELETE",
  });
}
