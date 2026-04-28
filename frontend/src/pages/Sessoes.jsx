import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as atividadesApi from "../api/atividades.js";
import { useSessoes } from "../hooks/useSessoes.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import CardSessao from "../components/sessoes/CardSessao.jsx";
import { formatarDuracao } from "../utils/formatarDuracao.js";

export default function Sessoes() {
  const { atividadeId } = useParams();
  const [atividade, setAtividade] = useState(null);
  const { sessoes, totalSegundos, carregando, erro, deletar } =
    useSessoes(atividadeId);
  const [confirmandoDelete, setConfirmandoDelete] = useState(null);
  const [erroDelete, setErroDelete] = useState("");

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

  async function handleDeletar() {
    setErroDelete("");
    try {
      await deletar(confirmandoDelete.id);
      setConfirmandoDelete(null);
    } catch {
      setErroDelete("Erro ao deletar sessão.");
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/atividades"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 mb-2"
        >
          <ChevronLeftIcon />
          Atividades
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Histórico</h2>
          {atividade && (
            <p className="text-xs text-text-muted truncate">{atividade.nome}</p>
          )}
        </div>
        {sessoes.length > 0 && (
          <p className="mt-3 text-sm text-text-secondary">
            <strong className="text-text-primary tabular-nums">
              {formatarDuracao(totalSegundos)}
            </strong>{" "}
            registrados
          </p>
        )}
      </div>

      {sessoes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">
            Nenhuma sessão registrada ainda.
          </p>
          <div className="mt-4">
            <Link
              to={`/atividades/${atividadeId}/registrar`}
              className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 ease-in-out cursor-pointer bg-accent text-white shadow-sm hover:bg-accent-hover px-4 py-2 text-sm"
            >
              Registrar primeira sessão
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessoes.map((sessao) => (
            <CardSessao
              key={sessao.id}
              sessao={sessao}
              onDeletar={setConfirmandoDelete}
            />
          ))}
        </div>
      )}

      <Modal
        aberto={!!confirmandoDelete}
        onFechar={() => {
          setConfirmandoDelete(null);
          setErroDelete("");
        }}
        titulo="Deletar sessão"
      >
        <p className="text-sm text-text-secondary mb-6">
          Deletar essa sessão? Esta ação não pode ser desfeita.
        </p>
        {erroDelete && (
          <p className="text-sm text-danger mb-4">{erroDelete}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmandoDelete(null);
              setErroDelete("");
            }}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeletar}>
            Deletar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
