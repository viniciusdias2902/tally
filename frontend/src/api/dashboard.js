import { api } from "./client.js";

export function heatmap({ pastaId, atividadeId, desdeDias } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  if (desdeDias) params.set("desdeDias", String(desdeDias));
  const query = params.toString();
  return api(`/dashboard/heatmap${query ? `?${query}` : ""}`);
}

export function kpis({ pastaId, atividadeId } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  const query = params.toString();
  return api(`/dashboard/kpis${query ? `?${query}` : ""}`);
}
