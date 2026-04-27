import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer() {
  const [estado, setEstado] = useState("idle"); // "idle" | "running" | "paused"
  const [tempoDecorrido, setTempoDecorrido] = useState(0); // segundos acumulados

  const intervaloRef = useRef(null);
  const ultimoTickRef = useRef(null);
  const iniciadoEmRef = useRef(null);

  // --- Formatar HH:MM:SS ---
  const horas = String(Math.floor(tempoDecorrido / 3600)).padStart(2, "0");
  const minutos = String(Math.floor((tempoDecorrido % 3600) / 60)).padStart(2, "0");
  const segundos = String(tempoDecorrido % 60).padStart(2, "0");
  const tempoFormatado = `${horas}:${minutos}:${segundos}`;

  // --- Tick do intervalo ---
  const startInterval = useCallback(() => {
    ultimoTickRef.current = Date.now();
    intervaloRef.current = setInterval(() => {
      const agora = Date.now();
      const delta = Math.floor((agora - ultimoTickRef.current) / 1000);
      if (delta >= 1) {
        setTempoDecorrido((prev) => prev + delta);
        ultimoTickRef.current = agora;
      }
    }, 250); // polling a cada 250ms para maior precisão
  }, []);

  const stopInterval = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  // --- Controles ---
  const iniciar = useCallback(() => {
    iniciadoEmRef.current = new Date().toISOString();
    setTempoDecorrido(0);
    setEstado("running");
    startInterval();
  }, [startInterval]);

  const pausar = useCallback(() => {
    stopInterval();
    setEstado("paused");
  }, [stopInterval]);

  const retomar = useCallback(() => {
    setEstado("running");
    startInterval();
  }, [startInterval]);

  const parar = useCallback(() => {
    stopInterval();
    const resultado = {
      iniciadoEm: iniciadoEmRef.current,
      duracaoSegundos: tempoDecorrido,
    };
    setEstado("idle");
    setTempoDecorrido(0);
    iniciadoEmRef.current = null;
    return resultado;
  }, [stopInterval, tempoDecorrido]);

  // --- beforeunload: avisa ao fechar aba com timer ativo ---
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (estado === "running" || estado === "paused") {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [estado]);

  // --- Cleanup do intervalo ao desmontar ---
  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  return {
    tempoFormatado,
    tempoDecorrido,
    estado,
    isActive: estado !== "idle",
    isRunning: estado === "running",
    isPaused: estado === "paused",
    iniciar,
    pausar,
    retomar,
    parar,
  };
}
