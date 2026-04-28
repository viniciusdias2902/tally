import { api } from "./client.js";

export function buscar(atividadeId) {
  return api(`/atividades/${atividadeId}/config-pomodoro`);
}
