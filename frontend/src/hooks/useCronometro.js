import { useCallback, useEffect, useRef, useState } from "react";

const PREFIXO_STORAGE = "tally-cronometro-";

function lerEstado(chave) {
  if (!chave) return { acumulado: 0, inicioCorrida: null };
  try {
    const bruto = localStorage.getItem(PREFIXO_STORAGE + chave);
    if (!bruto) return { acumulado: 0, inicioCorrida: null };
    const dados = JSON.parse(bruto);
    return {
      acumulado: Number(dados.acumulado) || 0,
      inicioCorrida: dados.inicioCorrida || null,
    };
  } catch {
    return { acumulado: 0, inicioCorrida: null };
  }
}

function gravarEstado(chave, estado) {
  if (!chave) return;
  localStorage.setItem(PREFIXO_STORAGE + chave, JSON.stringify(estado));
}

function limparEstado(chave) {
  if (!chave) return;
  localStorage.removeItem(PREFIXO_STORAGE + chave);
}

function calcularSegundos({ acumulado, inicioCorrida }) {
  if (!inicioCorrida) return acumulado;
  const inicio = new Date(inicioCorrida).getTime();
  const decorridos = Math.floor((Date.now() - inicio) / 1000);
  return acumulado + Math.max(0, decorridos);
}

export function useCronometro(chave) {
  const [estado, setEstado] = useState(() => lerEstado(chave));
  const [, forcarTick] = useState(0);
  const intervaloRef = useRef(null);

  useEffect(() => {
    setEstado(lerEstado(chave));
  }, [chave]);

  useEffect(() => {
    if (!estado.inicioCorrida) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      return;
    }
    intervaloRef.current = setInterval(() => forcarTick((n) => n + 1), 1000);
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    };
  }, [estado.inicioCorrida]);

  const iniciar = useCallback(() => {
    setEstado((prev) => {
      if (prev.inicioCorrida) return prev;
      const novo = { ...prev, inicioCorrida: new Date().toISOString() };
      gravarEstado(chave, novo);
      return novo;
    });
  }, [chave]);

  const pausar = useCallback(() => {
    setEstado((prev) => {
      if (!prev.inicioCorrida) return prev;
      const acumulado = calcularSegundos(prev);
      const novo = { acumulado, inicioCorrida: null };
      gravarEstado(chave, novo);
      return novo;
    });
  }, [chave]);

  const resetar = useCallback(() => {
    limparEstado(chave);
    setEstado({ acumulado: 0, inicioCorrida: null });
  }, [chave]);

  const segundos = calcularSegundos(estado);
  const rodando = Boolean(estado.inicioCorrida);

  return { segundos, rodando, iniciar, pausar, resetar };
}
