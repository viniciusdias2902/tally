import { useState } from "react";
import Button from "../ui/Button.jsx";

export default function RegistroBinario({ onRegistrar, enviando }) {
  const [confirmacao, setConfirmacao] = useState(null);

  async function handleClick() {
    setConfirmacao(null);
    try {
      await onRegistrar({ duracaoSegundos: 0, modo: "check_binario" });
      setConfirmacao("ok");
    } catch {
      setConfirmacao("erro");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="text-center space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Registrar conclusão</h3>
          <p className="text-sm text-text-secondary">
            Marque que você concluiu esta atividade hoje.
          </p>
        </div>

        <Button
          onClick={handleClick}
          disabled={enviando}
          size="lg"
          className="min-w-[14rem]"
        >
          <CheckIcon />
          {enviando ? "Registrando..." : "Registrar como feito"}
        </Button>

        {confirmacao === "ok" && (
          <p className="text-sm text-success">Sessão registrada com sucesso.</p>
        )}
        {confirmacao === "erro" && (
          <p className="text-sm text-danger">
            Erro ao registrar. Tente novamente.
          </p>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
