import { useState } from "react";
import Button from "../ui/Button.jsx";
import { usePomodoro } from "../../hooks/usePomodoro.js";
import { useConfigPomodoro } from "../../hooks/useConfigPomodoro.js";
import { formatarDuracao } from "../../utils/formatarDuracao.js";

const ROTULOS_FASE = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
};

export default function RegistroPomodoro({ chave, onRegistrar, enviando }) {
  const { config } = useConfigPomodoro(chave);
  const {
    fase,
    segundosRestantes,
    segundosFocoTotal,
    ciclosCompletos,
    rodando,
    pausado,
    ocioso,
    iniciar,
    pausar,
    retomar,
    resetar,
  } = usePomodoro(chave, config);
  const [confirmacao, setConfirmacao] = useState(null);

  async function handleRegistrar() {
    setConfirmacao(null);
    const iniciadoEm = new Date(
      Date.now() - segundosFocoTotal * 1000,
    ).toISOString();
    try {
      await onRegistrar({
        duracaoSegundos: segundosFocoTotal,
        modo: "pomodoro",
        ciclosPomodoro: ciclosCompletos > 0 ? ciclosCompletos : null,
        iniciadoEm,
      });
      resetar();
      setConfirmacao("ok");
    } catch {
      setConfirmacao("erro");
    }
  }

  const podeRegistrar = !rodando && segundosFocoTotal > 0;
  const corCronometro =
    fase === "foco"
      ? "text-timer-running"
      : fase
      ? "text-timer-paused"
      : "text-text-primary";

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm">
      <div className="text-center space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-text-muted">
            {fase ? ROTULOS_FASE[fase] : "Pronto"}
          </p>
          <div
            className={`font-mono text-6xl font-semibold tabular-nums tracking-tight transition-colors duration-150 ${corCronometro}`}
            aria-live="polite"
          >
            {formatarDuracao(segundosRestantes)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <span>
            Ciclos: <strong className="text-text-secondary">{ciclosCompletos}</strong>
          </span>
          <span>
            Foco total:{" "}
            <strong className="text-text-secondary">
              {formatarDuracao(segundosFocoTotal)}
            </strong>
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          {ocioso && (
            <Button onClick={iniciar} size="lg">
              <PlayIcon /> Iniciar foco
            </Button>
          )}
          {rodando && (
            <Button onClick={pausar} variant="secondary" size="lg">
              <PauseIcon /> Pausar
            </Button>
          )}
          {pausado && (
            <Button onClick={retomar} size="lg">
              <PlayIcon /> Continuar
            </Button>
          )}
          {!ocioso && (
            <Button onClick={resetar} variant="ghost" size="lg">
              Resetar
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
        {ocioso && (
          <p className="text-xs text-text-muted">
            {config.minutosFoco} min foco / {config.minutosPausaCurta} min pausa.
          </p>
        )}
        {rodando && (
          <p className="text-xs text-text-muted">Pause para registrar.</p>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 001.55.83l10.5-6.86a1 1 0 000-1.66L9.55 4.31A1 1 0 008 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
