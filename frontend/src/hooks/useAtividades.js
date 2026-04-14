import { useCallback, useEffect, useState } from "react";
import * as atividadesApi from "../api/atividades.js";

export function useAtividades() {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await atividadesApi.listar();
      setAtividades(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criar(dados) {
    const nova = await atividadesApi.criar(dados);
    setAtividades((prev) => [...prev, nova]);
    return nova;
  }

  async function atualizar(id, dados) {
    const atualizada = await atividadesApi.atualizar(id, dados);
    setAtividades((prev) =>
      prev.map((a) => (a.id === id ? atualizada : a)),
    );
    return atualizada;
  }

  async function arquivar(id) {
    await atividadesApi.arquivar(id);
    setAtividades((prev) => prev.filter((a) => a.id !== id));
  }

  async function deletar(id) {
    await atividadesApi.deletar(id);
    setAtividades((prev) => prev.filter((a) => a.id !== id));
  }

  return { atividades, carregando, erro, criar, atualizar, arquivar, deletar, recarregar: carregar };
}
