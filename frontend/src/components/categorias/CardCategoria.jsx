import { useState } from "react";
import Button from "../ui/Button.jsx";

export default function CardCategoria({ categoria, onEditar, onArquivar, onDeletar }) {
  const [confirmando, setConfirmando] = useState(null);

  function handleAcao(acao, callback) {
    if (confirmando === acao) {
      callback();
      setConfirmando(null);
    } else {
      setConfirmando(acao);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-bg-elevated p-4 shadow-sm transition-all duration-150 hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className="h-4 w-4 rounded-full shrink-0 border border-black/10 dark:border-white/10"
          style={{ backgroundColor: categoria.cor }}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {categoria.nome}
        </h3>
      </div>

      <div className="flex items-center gap-1 ml-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEditar(categoria)}>
          <EditIcon />
        </Button>

        {confirmando === "arquivar" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAcao("arquivar", () => onArquivar(categoria.id))}
          >
            Confirmar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAcao("arquivar", () => onArquivar(categoria.id))}
            title="Arquivar"
          >
            <ArchiveIcon />
          </Button>
        )}

        {confirmando === "deletar" ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleAcao("deletar", () => onDeletar(categoria.id))}
          >
            Confirmar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAcao("deletar", () => onDeletar(categoria.id))}
            title="Deletar"
          >
            <TrashIcon />
          </Button>
        )}

        {confirmando && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmando(null)}>
            <XIcon />
          </Button>
        )}
      </div>
    </div>
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

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
