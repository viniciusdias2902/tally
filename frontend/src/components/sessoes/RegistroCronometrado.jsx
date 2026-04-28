import { useState } from "react";
import Button from "../ui/Button.jsx";
import TimerRing from "./TimerRing.jsx";
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
  const ocioso = segundos === 0 && !rodando;

  let statusLabel = "Pronto";
  let statusTexto = "text-timer-idle";
  let cor = "text-timer-idle";
  let pulsar = false;
  let progresso = 0;
  if (rodando) {
    statusLabel = "Em curso";
    statusTexto = "text-timer-running";
    cor = "text-timer-running";
    pulsar = true;
    progresso = 1;
  } else if (segundos > 0) {
    statusLabel = "Pausado";
    statusTexto = "text-timer-paused";
    cor = "text-timer-paused";
    progresso = 1;
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm flex flex-col items-center gap-6">
      <TimerRing progresso={progresso} cor={cor} pulsar={pulsar}>
        <span className={`text-xs uppercase tracking-wider font-medium ${statusTexto}`}>
          {statusLabel}
        </span>
        <div
          className={`font-mono text-5xl font-semibold tabular-nums tracking-tight transition-colors duration-300 ${cor}`}
          aria-live="polite"
        >
          {formatarDuracao(segundos)}
        </div>
      </TimerRing>

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

      <div className="w-full space-y-3">
        <Button
          onClick={handleRegistrar}
          disabled={!podeRegistrar || enviando}
          size="lg"
          className="w-full"
        >
          {enviando ? "Registrando..." : "Registrar sessão"}
        </Button>

        <div className="text-center h-4 text-sm">
          {confirmacao === "ok" && (
            <span className="text-success">Sessão registrada com sucesso.</span>
          )}
          {confirmacao === "erro" && (
            <span className="text-danger">Erro ao registrar. Tente novamente.</span>
          )}
          {!confirmacao && ocioso && (
            <span className="text-xs text-text-muted">
              Inicie o cronômetro para começar
            </span>
          )}
        </div>
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
