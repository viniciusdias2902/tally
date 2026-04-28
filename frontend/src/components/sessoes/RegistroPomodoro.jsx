import { useState } from "react";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import TimerRing from "./TimerRing.jsx";
import FormConfigPomodoro from "./FormConfigPomodoro.jsx";
import { usePomodoro } from "../../hooks/usePomodoro.js";
import { useConfigPomodoro } from "../../hooks/useConfigPomodoro.js";
import { formatarDuracao } from "../../utils/formatarDuracao.js";

const ROTULOS_FASE = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
};

export default function RegistroPomodoro({ chave, onRegistrar, enviando }) {
  const { config, atualizar, restaurarPadrao } = useConfigPomodoro(chave);
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
  const [configAberta, setConfigAberta] = useState(false);

  async function handleSalvarConfig(dados) {
    await atualizar(dados);
    setConfigAberta(false);
  }

  async function handleRestaurarConfig() {
    await restaurarPadrao();
    setConfigAberta(false);
  }

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
            <span className="inline-flex items-center gap-2 text-xs text-text-muted">
              {config.minutosFoco}/{config.minutosPausaCurta} min · {totalDots} ciclos por rodada
              <button
                type="button"
                onClick={() => setConfigAberta(true)}
                aria-label="Configurar Pomodoro"
                className="text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer"
              >
                <GearIcon />
              </button>
            </span>
          )}
        </div>
      </div>

      <Modal
        aberto={configAberta}
        onFechar={() => setConfigAberta(false)}
        titulo="Configurar Pomodoro"
      >
        <FormConfigPomodoro
          config={config}
          onSalvar={handleSalvarConfig}
          onRestaurar={handleRestaurarConfig}
          onCancelar={() => setConfigAberta(false)}
        />
      </Modal>
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

function GearIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.149-.894z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
