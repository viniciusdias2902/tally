import { useEffect, useState } from "react";
import * as sessoesApi from "../api/sessoes.js";

const LIMITE_PADRAO = 20;

export function useSessoes(atividadeId, { limite = LIMITE_PADRAO } = {}) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!atividadeId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    Promise.all([
      sessoesApi.listar(atividadeId, { pagina, limite }),
      sessoesApi.somarDuracao(atividadeId),
    ])
      .then(([resposta, soma]) => {
        if (cancelado) return;
        setSessoes(resposta.items ?? []);
        setTotalPaginas(resposta.totalPaginas ?? 1);
        setTotal(resposta.total ?? 0);
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
  }, [atividadeId, pagina, limite]);

  async function deletar(id) {
    const sessao = sessoes.find((s) => s.id === id);
    await sessoesApi.deletar(atividadeId, id);
    setSessoes((prev) => prev.filter((s) => s.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    if (sessao) {
      setTotalSegundos((prev) => Math.max(0, prev - (sessao.duracaoSegundos ?? 0)));
    }
  }

  return {
    sessoes,
    totalSegundos,
    pagina,
    setPagina,
    totalPaginas,
    total,
    carregando,
    erro,
    deletar,
  };
}
