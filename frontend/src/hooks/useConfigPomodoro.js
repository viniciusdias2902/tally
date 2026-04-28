import { useEffect, useState } from "react";
import * as configPomodoroApi from "../api/configPomodoro.js";

export const PADRAO = {
  minutosFoco: 25,
  minutosPausaCurta: 5,
  minutosPausaLonga: 15,
  ciclosAntesLonga: 4,
};

export function useConfigPomodoro(atividadeId) {
  const [config, setConfig] = useState(PADRAO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!atividadeId) return;
    let cancelado = false;
    setCarregando(true);

    configPomodoroApi
      .buscar(atividadeId)
      .then((dados) => {
        if (!cancelado) setConfig(dados);
      })
      .catch((err) => {
        if (!cancelado && err.status === 404) setConfig(PADRAO);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [atividadeId]);

  async function atualizar(dados) {
    const atualizada = await configPomodoroApi.upsert(atividadeId, dados);
    setConfig(atualizada);
    return atualizada;
  }

  async function restaurarPadrao() {
    try {
      await configPomodoroApi.deletar(atividadeId);
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    setConfig(PADRAO);
  }

  return { config, carregando, atualizar, restaurarPadrao };
}
