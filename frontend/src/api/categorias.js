import { api } from "./client.js";

export function listar(atividadeId) {
  return api(`/atividades/${atividadeId}/categorias`);
}
