import { useEffect, useState } from "react";
import * as sessoesApi from "../api/sessoes.js";

const LIMITE = 100;

export function useSessoes(atividadeId) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!atividadeId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    Promise.all([
      sessoesApi.listar(atividadeId, { limite: LIMITE }),
      sessoesApi.somarDuracao(atividadeId),
    ])
      .then(([lista, soma]) => {
        if (cancelado) return;
        setSessoes(lista);
        setTotalSegundos(soma.totalSegundos ?? 0);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [atividadeId]);

  async function deletar(id) {
    const sessao = sessoes.find((s) => s.id === id);
    await sessoesApi.deletar(atividadeId, id);
    setSessoes((prev) => prev.filter((s) => s.id !== id));
    if (sessao) {
      setTotalSegundos((prev) => Math.max(0, prev - (sessao.duracaoSegundos ?? 0)));
    }
  }

  return { sessoes, totalSegundos, carregando, erro, deletar };
}
