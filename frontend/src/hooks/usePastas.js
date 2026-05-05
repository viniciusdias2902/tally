import { useCallback, useEffect, useState } from "react";
import * as pastasApi from "../api/pastas.js";

export function usePastas() {
  const [pastas, setPastas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await pastasApi.listar();
      setPastas(dados);
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
    const nova = await pastasApi.criar(dados);
    setPastas((prev) => [...prev, nova]);
    return nova;
  }

  async function atualizar(id, dados) {
    const atualizada = await pastasApi.atualizar(id, dados);
    setPastas((prev) => prev.map((p) => (p.id === id ? atualizada : p)));
    return atualizada;
  }

  async function deletar(id) {
    await pastasApi.deletar(id);
    setPastas((prev) => prev.filter((p) => p.id !== id));
  }

  return { pastas, carregando, erro, criar, atualizar, deletar, recarregar: carregar };
}
