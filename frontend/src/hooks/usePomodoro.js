import { useCallback, useEffect, useRef, useState } from "react";

// --- Constantes da máquina de estados ---
const ESTADOS = {
  FOCO: "FOCO",
  PAUSA_CURTA: "PAUSA_CURTA",
  PAUSA_LONGA: "PAUSA_LONGA",
};

const CONFIG_PADRAO = {
  minutosFoco: 25,
  minutosPausaCurta: 5,
  minutosPausaLonga: 15,
  ciclosAntesLonga: 4,
};

// --- Som suave via Web Audio API ---
function tocarBeepTransicao() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tocarNota = (startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      osc.start(startTime);
      osc.stop(startTime + 0.12);
    };
    const agora = ctx.currentTime;
    tocarNota(agora);
    tocarNota(agora + 0.18);
  } catch {
    // silently ignore if audio not available
  }
}

/**
 * Hook usePomodoro — máquina de estados com ciclos de Pomodoro.
 *
 * @param {object} config - Configuração do pomodoro (pode ser parcial, usa defaults).
 */
export function usePomodoro(config = {}) {
  const {
    minutosFoco = CONFIG_PADRAO.minutosFoco,
    minutosPausaCurta = CONFIG_PADRAO.minutosPausaCurta,
    minutosPausaLonga = CONFIG_PADRAO.minutosPausaLonga,
    ciclosAntesLonga = CONFIG_PADRAO.ciclosAntesLonga,
  } = config;

  // --- Estado da máquina ---
  const [estadoAtual, setEstadoAtual] = useState(ESTADOS.FOCO);
  const [cicloAtual, setCicloAtual] = useState(1); // ciclo de foco atual (1-based)
  const [ciclosCompletos, setCiclosCompletos] = useState(0);

  // --- Timer ---
  const [status, setStatus] = useState("idle"); // "idle" | "running" | "paused"
  const [tempoRestante, setTempoRestante] = useState(minutosFoco * 60);

  // --- Acumuladores ---
  const tempoFocoAcumuladoRef = useRef(0);
  const ultimoTickFocoRef = useRef(null); // para calcular tempo gasto em foco ao pausar/pular
  const iniciadoEmRef = useRef(null);

  // --- Intervalo ---
  const intervaloRef = useRef(null);
  const ultimoTickRef = useRef(null);

  // Ref para acessar estadoAtual dentro do callback sem stale closure
  const estadoRef = useRef(estadoAtual);
  const cicloRef = useRef(cicloAtual);
  const ciclosAntesLongaRef = useRef(ciclosAntesLonga);

  useEffect(() => { estadoRef.current = estadoAtual; }, [estadoAtual]);
  useEffect(() => { cicloRef.current = cicloAtual; }, [cicloAtual]);
  useEffect(() => { ciclosAntesLongaRef.current = ciclosAntesLonga; }, [ciclosAntesLonga]);

  // --- Duração para o estado atual ---
  const duracaoParaEstado = useCallback((estado) => {
    switch (estado) {
      case ESTADOS.FOCO: return minutosFoco * 60;
      case ESTADOS.PAUSA_CURTA: return minutosPausaCurta * 60;
      case ESTADOS.PAUSA_LONGA: return minutosPausaLonga * 60;
      default: return minutosFoco * 60;
    }
  }, [minutosFoco, minutosPausaCurta, minutosPausaLonga]);

  // --- Acumular tempo de foco ---
  const acumularFoco = useCallback(() => {
    if (estadoRef.current === ESTADOS.FOCO && ultimoTickFocoRef.current !== null) {
      const agora = Date.now();
      const delta = Math.floor((agora - ultimoTickFocoRef.current) / 1000);
      tempoFocoAcumuladoRef.current += delta;
      ultimoTickFocoRef.current = null;
    }
  }, []);

  // --- Transição de estado ---
  const transitarEstado = useCallback(() => {
    tocarBeepTransicao();

    const estadoAnterior = estadoRef.current;
    const cicloAnterior = cicloRef.current;

    if (estadoAnterior === ESTADOS.FOCO) {
      // Foco concluído — incrementar ciclos completos
      setCiclosCompletos((prev) => prev + 1);

      if (cicloAnterior >= ciclosAntesLongaRef.current) {
        // Atingiu ciclos necessários → PAUSA_LONGA
        setEstadoAtual(ESTADOS.PAUSA_LONGA);
        setTempoRestante(duracaoParaEstado(ESTADOS.PAUSA_LONGA));
      } else {
        // Ainda não atingiu → PAUSA_CURTA
        setEstadoAtual(ESTADOS.PAUSA_CURTA);
        setTempoRestante(duracaoParaEstado(ESTADOS.PAUSA_CURTA));
      }
    } else if (estadoAnterior === ESTADOS.PAUSA_CURTA) {
      // Pausa curta concluída → próximo FOCO
      setCicloAtual((prev) => prev + 1);
      setEstadoAtual(ESTADOS.FOCO);
      setTempoRestante(duracaoParaEstado(ESTADOS.FOCO));
      ultimoTickFocoRef.current = Date.now();
    } else if (estadoAnterior === ESTADOS.PAUSA_LONGA) {
      // Pausa longa concluída → reiniciar ciclos
      setCicloAtual(1);
      setEstadoAtual(ESTADOS.FOCO);
      setTempoRestante(duracaoParaEstado(ESTADOS.FOCO));
      ultimoTickFocoRef.current = Date.now();
    }
  }, [duracaoParaEstado]);

  // --- Tick do intervalo ---
  const startInterval = useCallback(() => {
    ultimoTickRef.current = Date.now();
    intervaloRef.current = setInterval(() => {
      const agora = Date.now();
      const delta = Math.floor((agora - ultimoTickRef.current) / 1000);
      if (delta >= 1) {
        ultimoTickRef.current = agora;
        setTempoRestante((prev) => {
          const novoTempo = prev - delta;
          if (novoTempo <= 0) {
            // Acumular foco se estava em FOCO
            if (estadoRef.current === ESTADOS.FOCO) {
              // Acumula o tempo restante antes da transição
              tempoFocoAcumuladoRef.current += prev; // prev é o que restava
              ultimoTickFocoRef.current = null;
            }
            // Agendar transição no próximo tick do React
            setTimeout(() => transitarEstado(), 0);
            return 0;
          }
          return novoTempo;
        });
      }
    }, 250);
  }, [transitarEstado]);

  const stopInterval = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  // --- Controles ---
  const iniciar = useCallback(() => {
    iniciadoEmRef.current = new Date().toISOString();
    tempoFocoAcumuladoRef.current = 0;
    setCicloAtual(1);
    setCiclosCompletos(0);
    setEstadoAtual(ESTADOS.FOCO);
    setTempoRestante(duracaoParaEstado(ESTADOS.FOCO));
    setStatus("running");
    ultimoTickFocoRef.current = Date.now();
    startInterval();
  }, [duracaoParaEstado, startInterval]);

  const pausar = useCallback(() => {
    stopInterval();
    acumularFoco();
    setStatus("paused");
  }, [stopInterval, acumularFoco]);

  const retomar = useCallback(() => {
    setStatus("running");
    if (estadoRef.current === ESTADOS.FOCO) {
      ultimoTickFocoRef.current = Date.now();
    }
    startInterval();
  }, [startInterval]);

  const pular = useCallback(() => {
    stopInterval();
    acumularFoco();
    transitarEstado();
    // Continuar rodando se estava rodando
    if (estadoRef.current === ESTADOS.FOCO) {
      ultimoTickFocoRef.current = Date.now();
    }
    startInterval();
  }, [stopInterval, acumularFoco, transitarEstado, startInterval]);

  const parar = useCallback(() => {
    stopInterval();
    acumularFoco();
    const resultado = {
      iniciadoEm: iniciadoEmRef.current,
      duracaoSegundos: tempoFocoAcumuladoRef.current,
      ciclosCompletos: ciclosCompletos,
    };

    // Reset
    setStatus("idle");
    setEstadoAtual(ESTADOS.FOCO);
    setCicloAtual(1);
    setCiclosCompletos(0);
    setTempoRestante(duracaoParaEstado(ESTADOS.FOCO));
    tempoFocoAcumuladoRef.current = 0;
    ultimoTickFocoRef.current = null;
    iniciadoEmRef.current = null;

    return resultado;
  }, [stopInterval, acumularFoco, ciclosCompletos, duracaoParaEstado]);

  // --- beforeunload ---
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (status === "running" || status === "paused") {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // --- Cleanup ---
  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  // --- Formatação MM:SS ---
  const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
  const segundos = String(tempoRestante % 60).padStart(2, "0");
  const tempoRestanteFormatado = `${minutos}:${segundos}`;

  return {
    tempoRestanteFormatado,
    estadoAtual,
    cicloAtual,
    ciclosCompletos,
    ciclosAntesLonga,
    isActive: status !== "idle",
    isRunning: status === "running",
    isPaused: status === "paused",
    tempoFocoAcumulado: tempoFocoAcumuladoRef.current,
    controles: {
      iniciar,
      pausar,
      retomar,
      pular,
      parar,
    },
  };
}
