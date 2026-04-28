import { useCallback, useState } from "react";

const STORAGE_KEY = "tally-modo-cronometrado";
const PADRAO = "timer";
const MODOS_VALIDOS = ["timer", "pomodoro"];

function ler() {
  try {
    const valor = localStorage.getItem(STORAGE_KEY);
    return MODOS_VALIDOS.includes(valor) ? valor : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function useModoCronometrado() {
  const [modo, setModoState] = useState(ler);

  const setModo = useCallback((novo) => {
    if (!MODOS_VALIDOS.includes(novo)) return;
    localStorage.setItem(STORAGE_KEY, novo);
    setModoState(novo);
  }, []);

  return { modo, setModo };
}
