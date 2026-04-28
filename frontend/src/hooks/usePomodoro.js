import { useCallback, useEffect, useRef, useState } from "react";

const PREFIXO_STORAGE = "tally-pomodoro-";

const ESTADO_INICIAL = {
  fase: null,
  fimFase: null,
  restanteAoPausar: null,
  ciclosCompletos: 0,
  segundosFocoAcumulados: 0,
};

function lerEstado(chave) {
  if (!chave) return ESTADO_INICIAL;
  try {
    const bruto = localStorage.getItem(PREFIXO_STORAGE + chave);
    if (!bruto) return ESTADO_INICIAL;
    return { ...ESTADO_INICIAL, ...JSON.parse(bruto) };
  } catch {
    return ESTADO_INICIAL;
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

function duracaoFase(fase, config) {
  if (fase === "foco") return config.minutosFoco * 60;
  if (fase === "pausa_curta") return config.minutosPausaCurta * 60;
  if (fase === "pausa_longa") return config.minutosPausaLonga * 60;
  return 0;
}

function calcularRestante(estado) {
  if (estado.restanteAoPausar != null) return estado.restanteAoPausar;
  if (!estado.fimFase) return 0;
  const ms = Date.parse(estado.fimFase) - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

function avancarFase(estado, config) {
  if (estado.fase === "foco") {
    const ciclos = estado.ciclosCompletos + 1;
    const segundos = estado.segundosFocoAcumulados + config.minutosFoco * 60;
    const proxima =
      ciclos % config.ciclosAntesLonga === 0 ? "pausa_longa" : "pausa_curta";
    return {
      ...estado,
      ciclosCompletos: ciclos,
      segundosFocoAcumulados: segundos,
      fase: proxima,
      fimFase: new Date(Date.now() + duracaoFase(proxima, config) * 1000).toISOString(),
      restanteAoPausar: null,
    };
  }
  return {
    ...estado,
    fase: "foco",
    fimFase: new Date(Date.now() + duracaoFase("foco", config) * 1000).toISOString(),
    restanteAoPausar: null,
  };
}

export function usePomodoro(chave, config) {
  const [estado, setEstado] = useState(() => lerEstado(chave));
  const [, forcarTick] = useState(0);
  const intervaloRef = useRef(null);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    setEstado(lerEstado(chave));
  }, [chave]);

  useEffect(() => {
    if (!estado.fimFase || estado.restanteAoPausar != null) {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      intervaloRef.current = null;
      return;
    }
    intervaloRef.current = setInterval(() => {
      setEstado((prev) => {
        if (!prev.fimFase || prev.restanteAoPausar != null) return prev;
        if (Date.now() < Date.parse(prev.fimFase)) {
          forcarTick((n) => n + 1);
          return prev;
        }
        const novo = avancarFase(prev, configRef.current);
        gravarEstado(chave, novo);
        return novo;
      });
    }, 1000);
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    };
  }, [estado.fimFase, estado.restanteAoPausar, chave]);

  const iniciar = useCallback(() => {
    setEstado((prev) => {
      if (prev.fase) return prev;
      const novo = {
        ...prev,
        fase: "foco",
        fimFase: new Date(Date.now() + duracaoFase("foco", configRef.current) * 1000).toISOString(),
        restanteAoPausar: null,
      };
      gravarEstado(chave, novo);
      return novo;
    });
  }, [chave]);

  const pausar = useCallback(() => {
    setEstado((prev) => {
      if (!prev.fimFase || prev.restanteAoPausar != null) return prev;
      const restante = calcularRestante(prev);
      const novo = { ...prev, fimFase: null, restanteAoPausar: restante };
      gravarEstado(chave, novo);
      return novo;
    });
  }, [chave]);

  const retomar = useCallback(() => {
    setEstado((prev) => {
      if (prev.restanteAoPausar == null) return prev;
      const novo = {
        ...prev,
        fimFase: new Date(Date.now() + prev.restanteAoPausar * 1000).toISOString(),
        restanteAoPausar: null,
      };
      gravarEstado(chave, novo);
      return novo;
    });
  }, [chave]);

  const resetar = useCallback(() => {
    limparEstado(chave);
    setEstado(ESTADO_INICIAL);
  }, [chave]);

  const segundosRestantes = calcularRestante(estado);
  const rodando = Boolean(estado.fimFase) && estado.restanteAoPausar == null;
  const pausado = estado.restanteAoPausar != null;
  const ocioso = !estado.fase;

  const segundosFocoParcial =
    estado.fase === "foco"
      ? duracaoFase("foco", config) - segundosRestantes
      : 0;
  const segundosFocoTotal = estado.segundosFocoAcumulados + segundosFocoParcial;

  return {
    fase: estado.fase,
    segundosRestantes,
    segundosFocoTotal,
    ciclosCompletos: estado.ciclosCompletos,
    rodando,
    pausado,
    ocioso,
    iniciar,
    pausar,
    retomar,
    resetar,
  };
}
