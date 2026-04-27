export function formatarDuracao(segundos) {
  const total = Math.max(0, Math.floor(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segs = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
}
