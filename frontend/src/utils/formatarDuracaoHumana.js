export function formatarDuracaoHumana(segundos) {
  const total = Math.max(0, Math.floor(segundos ?? 0));
  if (total < 60) return `${total}s`;
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  if (horas === 0) return `${minutos}min`;
  if (minutos === 0) return `${horas}h`;
  return `${horas}h ${minutos}min`;
}
