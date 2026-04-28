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

  let statusLabel = "Pronto";
  let statusTexto = "text-timer-idle";
  let statusBg = "bg-timer-idle";
  let digitoCor = "text-text-primary";
  let pulsar = false;
  if (rodando) {
    statusLabel = "Em curso";
    statusTexto = "text-timer-running";
    statusBg = "bg-timer-running";
    digitoCor = "text-timer-running";
    pulsar = true;
  } else if (segundos > 0) {
    statusLabel = "Pausado";
    statusTexto = "text-timer-paused";
    statusBg = "bg-timer-paused";
    digitoCor = "text-timer-paused";
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm min-h-[28rem] flex flex-col">
      <div className="flex flex-col items-center gap-6 flex-1">
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${statusBg} ${pulsar ? "animate-pulse-soft" : ""}`}
            aria-hidden="true"
          />
          <span className={`text-xs uppercase tracking-wider font-medium ${statusTexto}`}>
            {statusLabel}
          </span>
        </div>

        <div
          className={`font-mono text-7xl font-semibold tabular-nums tracking-tight transition-colors duration-300 ${digitoCor}`}
          aria-live="polite"
        >
          {formatarDuracao(segundos)}
        </div>

        <div className="text-xs text-text-muted h-4">
          {segundos === 0 && !rodando && "Inicie o cronômetro para começar"}
          {rodando && "Sessão em andamento"}
          {segundos > 0 && !rodando && "Continue ou registre o tempo acumulado"}
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
      </div>

      <div className="space-y-3 pt-4">
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
