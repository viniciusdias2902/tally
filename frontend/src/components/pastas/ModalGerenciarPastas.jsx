import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormPasta from "./FormPasta.jsx";

export default function ModalGerenciarPastas({ aberto, onFechar, pastas, onCriar, onAtualizar, onDeletar }) {
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmandoDelete, setConfirmandoDelete] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  function fechar() {
    setCriando(false);
    setEditando(null);
    setConfirmandoDelete(null);
    setErroAcao("");
    onFechar();
  }

  async function handleCriar(dados) {
    await onCriar(dados);
    setCriando(false);
  }

  async function handleAtualizar(dados) {
    await onAtualizar(editando.id, dados);
    setEditando(null);
  }

  async function handleDeletar(id) {
    setErroAcao("");
    try {
      await onDeletar(id);
      setConfirmandoDelete(null);
    } catch {
      setErroAcao("Erro ao deletar pasta.");
    }
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo="Gerenciar pastas">
      {criando ? (
        <FormPasta onSalvar={handleCriar} onCancelar={() => setCriando(false)} />
      ) : editando ? (
        <FormPasta
          pasta={editando}
          onSalvar={handleAtualizar}
          onCancelar={() => setEditando(null)}
        />
      ) : (
        <div className="space-y-4">
          {erroAcao && (
            <p className="text-sm text-danger text-center">{erroAcao}</p>
          )}

          {pastas.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              Nenhuma pasta criada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {pastas.map((pasta) => (
                <li
                  key={pasta.id}
                  className="flex items-center justify-between px-3 py-2.5 bg-bg-elevated"
                >
                  <span className="text-sm text-text-primary truncate">
                    {pasta.nome}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditando(pasta)}
                      aria-label={`Editar ${pasta.nome}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmandoDelete(pasta)}
                      aria-label={`Deletar ${pasta.nome}`}
                      className="text-danger hover:bg-danger/10"
                    >
                      Deletar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={fechar}>
              Fechar
            </Button>
            <Button onClick={() => setCriando(true)}>
              Nova pasta
            </Button>
          </div>
        </div>
      )}

      <Modal
        aberto={Boolean(confirmandoDelete)}
        onFechar={() => setConfirmandoDelete(null)}
        titulo="Deletar pasta"
      >
        <p className="text-sm text-text-secondary mb-6">
          Deletar{" "}
          <strong className="text-text-primary">
            {confirmandoDelete?.nome}
          </strong>
          ? As atividades dela ficam sem pasta — não são removidas.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmandoDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeletar(confirmandoDelete.id)}
          >
            Deletar
          </Button>
        </div>
      </Modal>
    </Modal>
  );
}
