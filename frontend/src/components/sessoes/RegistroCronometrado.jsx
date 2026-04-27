import { useState } from "react";
import Button from "../ui/Button.jsx";
import { useCronometro } from "../../hooks/useCronometro.js";
import { formatarDuracao } from "../../utils/formatarDuracao.js";

export default function RegistroCronometrado({ chave, onRegistrar, enviando }) {
  const { segundos, rodando, iniciar, pausar, resetar } = useCronometro(chave);
  const [confirmacao, setConfirmacao] = useState(null);

  async function handleRegistrar() {
    setConfirmacao(null);
    const iniciadoEm = new Date(Date.now() - segundos * 1000).toISOString();
    try {
      await onRegistrar({
        duracaoSegundos: segundos,
        modo: "timer",
        iniciadoEm,
      });
      resetar();
      setConfirmacao("ok");
    } catch {
      setConfirmacao("erro");
    }
  }

  function handleDescartar() {
    resetar();
    setConfirmacao(null);
  }

  const podeRegistrar = !rodando && segundos > 0;

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm">
      <div className="text-center space-y-6">
        <div
          className={`font-mono text-6xl font-semibold tabular-nums tracking-tight transition-colors duration-150 ${
            rodando ? "text-timer-running" : "text-text-primary"
          }`}
          aria-live="polite"
        >
          {formatarDuracao(segundos)}
        </div>

        <div className="flex items-center justify-center gap-2">
          {rodando ? (
            <Button onClick={pausar} variant="secondary" size="lg">
              <PauseIcon />
              Pausar
            </Button>
          ) : (
            <Button onClick={iniciar} size="lg">
              <PlayIcon />
              {segundos > 0 ? "Continuar" : "Iniciar"}
            </Button>
          )}

          {segundos > 0 && !rodando && (
            <Button onClick={handleDescartar} variant="ghost" size="lg">
              Descartar
            </Button>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleRegistrar}
            disabled={!podeRegistrar || enviando}
            size="lg"
            className="min-w-[14rem]"
          >
            {enviando ? "Registrando..." : "Registrar sessão"}
          </Button>
        </div>

        {confirmacao === "ok" && (
          <p className="text-sm text-success">Sessão registrada com sucesso.</p>
        )}
        {confirmacao === "erro" && (
          <p className="text-sm text-danger">
            Erro ao registrar. Tente novamente.
          </p>
        )}
        {!podeRegistrar && segundos === 0 && (
          <p className="text-xs text-text-muted">
            Inicie o cronômetro para registrar uma sessão.
          </p>
        )}
        {rodando && (
          <p className="text-xs text-text-muted">
            Pause o cronômetro para registrar.
          </p>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5.14v13.72a1 1 0 001.55.83l10.5-6.86a1 1 0 000-1.66L9.55 4.31A1 1 0 008 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
