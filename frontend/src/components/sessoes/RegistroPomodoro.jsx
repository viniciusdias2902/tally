import { useState } from "react";
import Button from "../ui/Button.jsx";
import TimerRing from "./TimerRing.jsx";
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
  const ehFoco = fase === "foco";
  const ehPausa = fase === "pausa_curta" || fase === "pausa_longa";

  let statusLabel = "Pronto";
  let statusTexto = "text-timer-idle";
  let cor = "text-timer-idle";
  let pulsar = false;
  if (pausado) {
    statusLabel = `${ROTULOS_FASE[fase]} — pausado`;
    statusTexto = "text-timer-paused";
    cor = "text-timer-paused";
  } else if (ehFoco) {
    statusLabel = "Em foco";
    statusTexto = "text-timer-running";
    cor = "text-timer-running";
    pulsar = true;
  } else if (ehPausa) {
    statusLabel = ROTULOS_FASE[fase];
    statusTexto = "text-accent";
    cor = "text-accent";
    pulsar = true;
  }

  const duracaoFase =
    fase === "foco"
      ? config.minutosFoco * 60
      : fase === "pausa_curta"
      ? config.minutosPausaCurta * 60
      : fase === "pausa_longa"
      ? config.minutosPausaLonga * 60
      : 1;
  const progresso = fase
    ? Math.min(1, Math.max(0, (duracaoFase - segundosRestantes) / duracaoFase))
    : 0;

  const totalDots = config.ciclosAntesLonga;
  const dotsCompletos = ciclosCompletos % totalDots;
  const tempoExibido = ocioso
    ? formatarDuracao(config.minutosFoco * 60)
    : formatarDuracao(segundosRestantes);

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
          {tempoExibido}
        </div>
        <div className="flex items-center gap-1.5 mt-1" aria-label="Ciclos da rodada">
          {Array.from({ length: totalDots }).map((_, i) => {
            const preenchido = i < dotsCompletos;
            return (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  preenchido ? "bg-accent" : "bg-bg-secondary border border-border"
                }`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </TimerRing>

      <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
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
              {config.minutosFoco}/{config.minutosPausaCurta} min · {totalDots} ciclos por rodada
            </span>
          )}
        </div>
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
