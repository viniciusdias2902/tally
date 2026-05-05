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

export function distribuicao({ pastaId, atividadeId } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  const query = params.toString();
  return api(`/dashboard/distribuicao${query ? `?${query}` : ""}`);
}

export function evolucao({ pastaId, atividadeId, dias } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  if (dias) params.set("dias", String(dias));
  const query = params.toString();
  return api(`/dashboard/evolucao${query ? `?${query}` : ""}`);
}

export function porHora({ pastaId, atividadeId } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  const query = params.toString();
  return api(`/dashboard/por-hora${query ? `?${query}` : ""}`);
}

export function porDiaSemana({ pastaId, atividadeId } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  const query = params.toString();
  return api(`/dashboard/por-dia-semana${query ? `?${query}` : ""}`);
}

export function porModo({ pastaId, atividadeId } = {}) {
  const params = new URLSearchParams();
  if (pastaId) params.set("pastaId", pastaId);
  if (atividadeId) params.set("atividadeId", atividadeId);
  const query = params.toString();
  return api(`/dashboard/por-modo${query ? `?${query}` : ""}`);
}
