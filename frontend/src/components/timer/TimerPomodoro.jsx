import { useCallback, useEffect, useState } from "react";
import { usePomodoro } from "../../hooks/usePomodoro.js";
import * as atividadesApi from "../../api/atividades.js";
import * as categoriasApi from "../../api/categorias.js";
import * as configPomodoroApi from "../../api/configPomodoro.js";
import * as sessoesApi from "../../api/sessoes.js";
import Spinner from "../ui/Spinner.jsx";

const CONFIG_PADRAO = {
  minutosFoco: 25,
  minutosPausaCurta: 5,
  minutosPausaLonga: 15,
  ciclosAntesLonga: 4,
};

// --- Mapa de cores por estado ---
const CORES_ESTADO = {
  FOCO: {
    borda: "border-[var(--color-pomodoro-foco)]",
    glow: "shadow-[0_0_60px_rgba(239,68,68,0.3)] dark:shadow-[0_0_60px_rgba(248,113,113,0.25)]",
    bg: "bg-[var(--color-pomodoro-foco)]",
    label: "🔴 Foco",
    ping: "border-[var(--color-pomodoro-foco)]/20",
  },
  PAUSA_CURTA: {
    borda: "border-[var(--color-pomodoro-pausa-curta)]",
    glow: "shadow-[0_0_60px_rgba(16,185,129,0.3)] dark:shadow-[0_0_60px_rgba(52,211,153,0.25)]",
    bg: "bg-[var(--color-pomodoro-pausa-curta)]",
    label: "🟢 Pausa Curta",
    ping: "border-[var(--color-pomodoro-pausa-curta)]/20",
  },
  PAUSA_LONGA: {
    borda: "border-[var(--color-pomodoro-pausa-longa)]",
    glow: "shadow-[0_0_60px_rgba(99,102,241,0.3)] dark:shadow-[0_0_60px_rgba(129,140,248,0.25)]",
    bg: "bg-[var(--color-pomodoro-pausa-longa)]",
    label: "🔵 Pausa Longa",
    ping: "border-[var(--color-pomodoro-pausa-longa)]/20",
  },
};

export default function TimerPomodoro() {
  // --- Atividades ---
  const [atividades, setAtividades] = useState([]);
  const [atividadeId, setAtividadeId] = useState("");
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);

  // --- Categorias ---
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  // --- Config do pomodoro ---
  const [configPomodoro, setConfigPomodoro] = useState(CONFIG_PADRAO);
  const [carregandoConfig, setCarregandoConfig] = useState(false);

  // --- Feedback ---
  const [toast, setToast] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // --- Hook Pomodoro ---
  const pomodoro = usePomodoro(configPomodoro);
  const cores = CORES_ESTADO[pomodoro.estadoAtual] || CORES_ESTADO.FOCO;

  // --- Carregar atividades (apenas cronometradas) ---
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await atividadesApi.listar();
        setAtividades(dados.filter((a) => a.tipoMedicao === "cronometrada"));
      } catch {
        setToast({ tipo: "erro", mensagem: "Erro ao carregar atividades." });
      } finally {
        setCarregandoAtividades(false);
      }
    }
    carregar();
  }, []);

  // --- Carregar categorias quando atividade muda ---
  useEffect(() => {
    if (!atividadeId) {
      setCategorias([]);
      setCategoriaId("");
      return;
    }

    let cancelado = false;
    async function carregar() {
      setCarregandoCategorias(true);
      setCategoriaId("");
      try {
        const dados = await categoriasApi.listar(atividadeId);
        if (!cancelado) setCategorias(dados);
      } catch {
        if (!cancelado) setCategorias([]);
      } finally {
        if (!cancelado) setCarregandoCategorias(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [atividadeId]);

  // --- Carregar config pomodoro quando atividade muda ---
  useEffect(() => {
    if (!atividadeId) {
      setConfigPomodoro(CONFIG_PADRAO);
      return;
    }

    let cancelado = false;
    async function carregar() {
      setCarregandoConfig(true);
      try {
        const dados = await configPomodoroApi.buscar(atividadeId);
        if (!cancelado) {
          setConfigPomodoro({
            minutosFoco: dados.minutosFoco ?? CONFIG_PADRAO.minutosFoco,
            minutosPausaCurta: dados.minutosPausaCurta ?? CONFIG_PADRAO.minutosPausaCurta,
            minutosPausaLonga: dados.minutosPausaLonga ?? CONFIG_PADRAO.minutosPausaLonga,
            ciclosAntesLonga: dados.ciclosAntesLonga ?? CONFIG_PADRAO.ciclosAntesLonga,
          });
        }
      } catch {
        // 404 = sem config, usar defaults
        if (!cancelado) setConfigPomodoro(CONFIG_PADRAO);
      } finally {
        if (!cancelado) setCarregandoConfig(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [atividadeId]);

  // --- Auto-hide toast ---
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // --- Parar e salvar ---
  const handleParar = useCallback(async () => {
    const { iniciadoEm, duracaoSegundos, ciclosCompletos } = pomodoro.controles.parar();

    if (duracaoSegundos <= 0 || !atividadeId) return;

    setSalvando(true);
    try {
      await sessoesApi.criar(atividadeId, {
        categoriaId: categoriaId || null,
        iniciadoEm,
        duracaoSegundos,
        modo: "pomodoro",
        ciclosPomodoro: ciclosCompletos || null,
      });
      setToast({ tipo: "sucesso", mensagem: "Sessão Pomodoro salva com sucesso!" });
    } catch {
      setToast({ tipo: "erro", mensagem: "Erro ao salvar a sessão." });
    } finally {
      setSalvando(false);
    }
  }, [pomodoro.controles, atividadeId, categoriaId]);

  // --- Indicador visual de progresso dos ciclos ---
  const indicadoresCiclo = [];
  for (let i = 1; i <= pomodoro.ciclosAntesLonga; i++) {
    const completo = i <= pomodoro.ciclosCompletos;
    const atual = i === pomodoro.cicloAtual && pomodoro.estadoAtual === "FOCO";
    indicadoresCiclo.push(
      <div
        key={i}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          completo
            ? "bg-[var(--color-pomodoro-foco)] scale-100"
            : atual
              ? "bg-[var(--color-pomodoro-foco)]/50 scale-110 animate-pulse"
              : "bg-border"
        }`}
        title={`Ciclo ${i}`}
      />,
    );
  }

  // --- Loading ---
  if (carregandoAtividades) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-lg mx-auto py-4">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-lg font-semibold">Pomodoro</h2>
        <p className="text-sm text-text-secondary mt-1">
          Foco com intervalos programados
        </p>
      </div>

      {/* Seletores */}
      <div className="w-full space-y-3">
        {/* Atividade */}
        <div>
          <label
            htmlFor="pomodoro-select-atividade"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Atividade
          </label>
          <select
            id="pomodoro-select-atividade"
            value={atividadeId}
            onChange={(e) => setAtividadeId(e.target.value)}
            disabled={pomodoro.isActive}
            className="w-full rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">Selecione uma atividade</option>
            {atividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label
            htmlFor="pomodoro-select-categoria"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Categoria{" "}
            <span className="text-text-muted font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <select
              id="pomodoro-select-categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={!atividadeId || carregandoCategorias || pomodoro.isActive}
              className="w-full rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              <option value="">
                {carregandoCategorias
                  ? "Carregando..."
                  : !atividadeId
                    ? "Selecione uma atividade primeiro"
                    : categorias.length === 0
                      ? "Nenhuma categoria disponível"
                      : "Sem categoria"}
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {carregandoCategorias && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

          <div className="flex items-center gap-4 justify-center text-xs text-text-muted pt-1">
            <span>{configPomodoro.minutosFoco}min foco</span>
            <span>·</span>
            <span>{configPomodoro.minutosPausaCurta}min pausa</span>
            <span>·</span>
            <span>{configPomodoro.minutosPausaLonga}min longa</span>
            <span>·</span>
            <span>{configPomodoro.ciclosAntesLonga} ciclos</span>
          </div>
        )}
        )}
      </div>

      {/* Display do Timer */}
      <div
        className={`relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 transition-all duration-500 ${
          pomodoro.isActive ? `${cores.borda} ${cores.glow}` : "border-border"
        }`}
      >
        {/* Anel animado quando rodando */}
        {pomodoro.isRunning && (
          <div className={`absolute inset-0 rounded-full border-4 ${cores.ping} animate-ping`} />
        )}

        <div className="flex flex-col items-center gap-1 z-10">
          <span
            className="text-5xl sm:text-6xl font-mono font-bold text-text-primary tabular-nums tracking-wider select-none"
          >
            {pomodoro.tempoRestanteFormatado}
          </span>

          {pomodoro.isActive ? (
            <>
              <span className="text-sm font-medium tracking-wide mt-1">
                {cores.label}
              </span>
              <span className="text-xs text-text-muted">
                Ciclo {pomodoro.cicloAtual} de {pomodoro.ciclosAntesLonga}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
              Parado
            </span>
          )}
        </div>
      </div>

      {/* Indicadores de ciclo */}
      {pomodoro.isActive && (
        <div className="flex items-center gap-2">
          {indicadoresCiclo}
        </div>
      )}

      {/* Botões de controle */}
      <div className="flex items-center gap-3">
        {!pomodoro.isActive ? (
          <button
            id="btn-pomodoro-iniciar"
            onClick={pomodoro.controles.iniciar}
            disabled={!atividadeId || carregandoConfig}
            className={`inline-flex items-center gap-2.5 rounded-2xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer bg-[var(--color-pomodoro-foco)] shadow-[var(--color-pomodoro-foco)]/25 hover:shadow-[var(--color-pomodoro-foco)]/30`}
          >
            <PlayIcon />
            Iniciar
          </button>
        ) : (
          <>
            {/* Pausar / Retomar */}
            {pomodoro.isRunning ? (
              <button
                id="btn-pomodoro-pausar"
                onClick={pomodoro.controles.pausar}
                className="inline-flex items-center gap-2 rounded-2xl bg-timer-paused px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-timer-paused/25 transition-all duration-200 hover:shadow-xl hover:shadow-timer-paused/30 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <PauseIcon />
                Pausar
              </button>
            ) : (
              <button
                id="btn-pomodoro-retomar"
                onClick={pomodoro.controles.retomar}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${cores.bg}`}
              >
                <PlayIcon />
                Retomar
              </button>
            )}

            {/* Pular */}
            <button
              id="btn-pomodoro-pular"
              onClick={pomodoro.controles.pular}
              className="inline-flex items-center gap-2 rounded-2xl bg-bg-secondary border border-border px-5 py-3.5 text-base font-semibold text-text-primary shadow-sm transition-all duration-200 hover:bg-bg-elevated hover:shadow-md hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <SkipIcon />
              Pular
            </button>

            {/* Parar */}
            <button
              id="btn-pomodoro-parar"
              onClick={handleParar}
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-2xl bg-danger px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-danger/25 transition-all duration-200 hover:shadow-xl hover:shadow-danger/30 hover:bg-danger-hover hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <StopIcon />
              {salvando ? "Salvando..." : "Parar"}
            </button>
          </>
        )}
      </div>

      {/* Dica quando sem atividade */}
      {!atividadeId && !pomodoro.isActive && (
        <p className="text-xs text-text-muted text-center animate-pulse">
          Selecione uma atividade para começar
        </p>
      )}

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-sm transition-all duration-300 animate-[slideUp_0.3s_ease-out] ${
            toast.tipo === "sucesso"
              ? "bg-success/90 text-white"
              : "bg-danger/90 text-white"
          }`}
        >
          {toast.tipo === "sucesso" ? <CheckIcon /> : <AlertIcon />}
          {toast.mensagem}
        </div>
      )}
    </div>
  );
}

// --- Ícones SVG ---

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
