let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function tocarNota(audioCtx, frequencia, inicio, duracao, volume = 0.07) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequencia;

  gain.gain.setValueAtTime(volume, inicio);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(inicio);
  osc.stop(inicio + duracao);
}

/**
 * Toca um acorde de sucesso ascendente (C5 → E5 → G5).
 * Som suave e curto (~0.45s total), estilo "chime" de produtividade.
 */
export function tocarSomSucesso() {
  try {
    const audioCtx = getCtx();
    const agora = audioCtx.currentTime;

    tocarNota(audioCtx, 523.25, agora, 0.25);        // C5
    tocarNota(audioCtx, 659.25, agora + 0.12, 0.25);  // E5
    tocarNota(audioCtx, 783.99, agora + 0.24, 0.35);  // G5 (sustain mais longo)
  } catch {
    // Silencioso se AudioContext não estiver disponível
  }
}
