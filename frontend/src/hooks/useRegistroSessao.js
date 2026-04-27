import { useState } from "react";
import * as sessoesApi from "../api/sessoes.js";

export function useRegistroSessao(atividadeId) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function registrar({
    categoriaId = null,
    duracaoSegundos,
    modo,
    iniciadoEm = new Date().toISOString(),
    ciclosPomodoro,
    observacoes,
  }) {
    setEnviando(true);
    setErro(null);
    try {
      const sessao = await sessoesApi.criar(atividadeId, {
        categoriaId,
        iniciadoEm,
        duracaoSegundos,
        modo,
        ciclosPomodoro,
        observacoes,
      });
      return sessao;
    } catch (err) {
      setErro(err.message);
      throw err;
    } finally {
      setEnviando(false);
    }
  }

  return { registrar, enviando, erro };
}
