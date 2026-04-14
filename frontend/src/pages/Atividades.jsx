import { useState } from "react";
import { useAtividades } from "../hooks/useAtividades.js";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import FormAtividade from "../components/atividades/FormAtividade.jsx";
import CardAtividade from "../components/atividades/CardAtividade.jsx";

export default function Atividades() {
  const { atividades, carregando, erro, criar, atualizar, arquivar, deletar } = useAtividades();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  function abrirCriacao() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(atividade) {
    setEditando(atividade);
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
      setErroAcao("Erro ao arquivar atividade.");
    }
  }

  async function handleDeletar(id) {
    setErroAcao("");
    try {
      await deletar(id);
    } catch (err) {
      if (err.message === "ATIVIDADE_COM_SESSOES") {
        setErroAcao("Não é possível deletar uma atividade com sessões. Arquive-a.");
      } else {
        setErroAcao("Erro ao deletar atividade.");
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Atividades</h2>
        <Button onClick={abrirCriacao}>
          <PlusIcon /> Nova atividade
        </Button>
      </div>

      {erroAcao && (
        <p className="text-sm text-danger mb-4 text-center">{erroAcao}</p>
      )}

      {atividades.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">
            Nenhuma atividade cadastrada.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Crie sua primeira atividade para começar a registrar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {atividades.map((atividade) => (
            <CardAtividade
              key={atividade.id}
              atividade={atividade}
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
        titulo={editando ? "Editar atividade" : "Nova atividade"}
      >
        <FormAtividade
          atividade={editando}
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
