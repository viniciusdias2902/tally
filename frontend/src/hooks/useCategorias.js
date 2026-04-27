import { useCallback, useEffect, useState } from "react";
import * as categoriasApi from "../api/categorias.js";

export function useCategorias(atividadeId) {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    if (!atividadeId) return;
    setCarregando(true);
    setErro(null);
    try {
      const dados = await categoriasApi.listar(atividadeId);
      setCategorias(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [atividadeId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criar(dados) {
    const nova = await categoriasApi.criar(atividadeId, dados);
    setCategorias((prev) => [...prev, nova]);
    return nova;
  }

  async function atualizar(id, dados) {
    const atualizada = await categoriasApi.atualizar(atividadeId, id, dados);
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? atualizada : c)),
    );
    return atualizada;
  }

  async function arquivar(id) {
    await categoriasApi.arquivar(atividadeId, id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }

  async function deletar(id) {
    await categoriasApi.deletar(atividadeId, id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }

  return {
    categorias,
    carregando,
    erro,
    criar,
    atualizar,
    arquivar,
    deletar,
    recarregar: carregar,
  };
}
