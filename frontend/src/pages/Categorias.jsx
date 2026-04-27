import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCategorias } from "../hooks/useCategorias.js";
import * as atividadesApi from "../api/atividades.js";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import FormCategoria from "../components/categorias/FormCategoria.jsx";
import CardCategoria from "../components/categorias/CardCategoria.jsx";

export default function Categorias() {
  const { atividadeId } = useParams();
  const { categorias, carregando, erro, criar, atualizar, arquivar, deletar } =
    useCategorias(atividadeId);
  const [atividade, setAtividade] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  useEffect(() => {
    let cancelado = false;
    atividadesApi
      .buscar(atividadeId)
      .then((dados) => {
        if (!cancelado) setAtividade(dados);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [atividadeId]);

  function abrirCriacao() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setEditando(categoria);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function handleSalvar(dados) {
    if (editando) {
      await atualizar(editando.id, dados);
    } else {
      await criar(dados);
    }
    fecharModal();
  }

  async function handleArquivar(id) {
    setErroAcao("");
    try {
      await arquivar(id);
    } catch {
      setErroAcao("Erro ao arquivar categoria.");
    }
  }

  async function handleDeletar(id) {
    setErroAcao("");
    try {
      await deletar(id);
    } catch (err) {
      if (err.message === "CATEGORIA_COM_SESSOES") {
        setErroAcao("Não é possível deletar uma categoria com sessões. Arquive-a.");
      } else {
        setErroAcao("Erro ao deletar categoria.");
      }
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-danger">{erro}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/atividades"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 mb-2"
        >
          <ChevronLeftIcon />
          Atividades
        </Link>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Categorias</h2>
            {atividade && (
              <p className="text-xs text-text-muted truncate">{atividade.nome}</p>
            )}
          </div>
          <Button onClick={abrirCriacao}>
            <PlusIcon /> Nova categoria
          </Button>
        </div>
      </div>

      {erroAcao && (
        <p className="text-sm text-danger mb-4 text-center">{erroAcao}</p>
      )}

      {categorias.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">
            Nenhuma categoria cadastrada.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Crie sua primeira categoria para organizar as sessões.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categorias.map((categoria) => (
            <CardCategoria
              key={categoria.id}
              categoria={categoria}
              onEditar={abrirEdicao}
              onArquivar={handleArquivar}
              onDeletar={handleDeletar}
            />
          ))}
        </div>
      )}

      <Modal
        aberto={modalAberto}
        onFechar={fecharModal}
        titulo={editando ? "Editar categoria" : "Nova categoria"}
      >
        <FormCategoria
          categoria={editando}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
