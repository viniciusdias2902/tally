import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import MenuKebab from "../ui/MenuKebab.jsx";
import Modal from "../ui/Modal.jsx";

export default function CardAtividade({ atividade, onEditar, onArquivar, onDeletar }) {
  const [confirmando, setConfirmando] = useState(null);

  function fechar() {
    setConfirmando(null);
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-bg-elevated p-4 shadow-sm transition-all duration-150 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {atividade.nome}
        </h3>
        <span className="text-xs text-text-muted">
          {atividade.tipoMedicao === "cronometrada" ? "Cronometrada" : "Binária"}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-3 shrink-0">
        <Link
          to={`/atividades/${atividade.id}/registrar`}
          className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 ease-in-out cursor-pointer bg-accent text-white shadow-sm hover:bg-accent-hover px-3 py-1.5 text-sm"
        >
          <PlayIcon /> Registrar
        </Link>

        <MenuKebab>
          <Link
            to={`/atividades/${atividade.id}/categorias`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors duration-150"
          >
            <TagIcon /> Categorias
          </Link>
          <button
            type="button"
            onClick={() => onEditar(atividade)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
          >
            <EditIcon /> Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando("arquivar")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
          >
            <ArchiveIcon /> Arquivar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando("deletar")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors duration-150 cursor-pointer"
          >
            <TrashIcon /> Deletar
          </button>
        </MenuKebab>
      </div>

      <Modal
        aberto={confirmando === "arquivar"}
        onFechar={fechar}
        titulo="Arquivar atividade"
      >
        <p className="text-sm text-text-secondary mb-6">
          Arquivar <strong className="text-text-primary">{atividade.nome}</strong>?
          Você poderá restaurar depois.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={fechar}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onArquivar(atividade.id);
              fechar();
            }}
          >
            Arquivar
          </Button>
        </div>
      </Modal>

      <Modal
        aberto={confirmando === "deletar"}
        onFechar={fechar}
        titulo="Deletar atividade"
      >
        <p className="text-sm text-text-secondary mb-6">
          Deletar <strong className="text-text-primary">{atividade.nome}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={fechar}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDeletar(atividade.id);
              fechar();
            }}
          >
            Deletar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 001.55.83l10.5-6.86a1 1 0 000-1.66L9.55 4.31A1 1 0 008 5.14z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

