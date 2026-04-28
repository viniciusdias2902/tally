const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatarDataRelativa(data, agora = new Date()) {
  const d = new Date(data);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diasAtras = Math.round((hoje - dia) / (1000 * 60 * 60 * 24));
  const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (diasAtras === 0) return `Hoje, ${hora}`;
  if (diasAtras === 1) return `Ontem, ${hora}`;
  if (diasAtras > 1 && diasAtras <= 6) {
    return `${DIAS_CURTOS[d.getDay()]}, ${hora}`;
  }

  const dataCurta = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  if (d.getFullYear() !== agora.getFullYear()) {
    return `${dataCurta}/${d.getFullYear()}`;
  }
  return `${dataCurta}, ${hora}`;
}
