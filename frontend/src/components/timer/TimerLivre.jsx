import { useCallback, useEffect, useState } from "react";
import { useTimer } from "../../hooks/useTimer.js";
import * as atividadesApi from "../../api/atividades.js";
import * as categoriasApi from "../../api/categorias.js";
import * as sessoesApi from "../../api/sessoes.js";
import Spinner from "../ui/Spinner.jsx";

export default function TimerLivre() {
  const timer = useTimer();

  // --- Atividades ---
  const [atividades, setAtividades] = useState([]);
  const [atividadeId, setAtividadeId] = useState("");
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);

  // --- Categorias ---
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  // --- Feedback ---
  const [toast, setToast] = useState(null); // { tipo: "sucesso" | "erro", mensagem }
  const [salvando, setSalvando] = useState(false);

  // --- Carregar atividades ---
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await atividadesApi.listar();
        setAtividades(dados);
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

  // --- Auto-hide toast ---
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // --- Handler: Parar e salvar ---
  const handleParar = useCallback(async () => {
    const { iniciadoEm, duracaoSegundos } = timer.parar();

    if (duracaoSegundos <= 0 || !atividadeId) return;

    setSalvando(true);
    try {
      await sessoesApi.criar(atividadeId, {
        categoriaId: categoriaId || null,
        iniciadoEm,
        duracaoSegundos,
        modo: "timer",
      });
      setToast({ tipo: "sucesso", mensagem: "Sessão salva com sucesso!" });
    } catch {
      setToast({ tipo: "erro", mensagem: "Erro ao salvar a sessão." });
    } finally {
      setSalvando(false);
    }
  }, [timer, atividadeId, categoriaId]);

  // --- Cor do anel do timer baseada no estado ---
  const corAnel =
    timer.isRunning
      ? "shadow-[0_0_60px_rgba(16,185,129,0.3)] dark:shadow-[0_0_60px_rgba(52,211,153,0.25)]"
      : timer.isPaused
        ? "shadow-[0_0_60px_rgba(245,158,11,0.3)] dark:shadow-[0_0_60px_rgba(251,191,36,0.25)]"
        : "";

  const corBorda =
    timer.isRunning
      ? "border-timer-running"
      : timer.isPaused
        ? "border-timer-paused"
        : "border-border";

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
        <h2 className="text-lg font-semibold">Timer Livre</h2>
        <p className="text-sm text-text-secondary mt-1">
          Selecione uma atividade e controle seu tempo
        </p>
      </div>

      {/* Seletores */}
      <div className="w-full space-y-3">
        {/* Atividade */}
        <div>
          <label
            htmlFor="select-atividade"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Atividade
          </label>
          <select
            id="select-atividade"
            value={atividadeId}
            onChange={(e) => setAtividadeId(e.target.value)}
            disabled={timer.isActive}
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
            htmlFor="select-categoria"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Categoria{" "}
            <span className="text-text-muted font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <select
              id="select-categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={!atividadeId || carregandoCategorias || timer.isActive}
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
      </div>

      {/* Display do Timer */}
      <div
        className={`relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 transition-all duration-500 ${corBorda} ${corAnel}`}
      >
        {/* Anel animado quando rodando */}
        {timer.isRunning && (
          <div className="absolute inset-0 rounded-full border-4 border-timer-running/20 animate-ping" />
        )}

        <div className="flex flex-col items-center gap-1 z-10">
          <span
            className="text-4xl sm:text-5xl font-mono font-bold text-text-primary tabular-nums tracking-wider select-none"
          >
            {timer.tempoFormatado}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
            {timer.isRunning
              ? "Rodando"
              : timer.isPaused
                ? "Pausado"
                : "Parado"}
          </span>
        </div>
      </div>

      {/* Botões de controle */}
      <div className="flex items-center gap-3">
        {!timer.isActive ? (
          /* INICIAR */
          <button
            id="btn-iniciar"
            onClick={timer.iniciar}
            disabled={!atividadeId}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-timer-running px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-timer-running/25 transition-all duration-200 hover:shadow-xl hover:shadow-timer-running/30 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer"
          >
            <PlayIcon />
            Iniciar
          </button>
        ) : (
          <>
            {/* PAUSAR / RETOMAR */}
            {timer.isRunning ? (
              <button
                id="btn-pausar"
                onClick={timer.pausar}
                className="inline-flex items-center gap-2 rounded-2xl bg-timer-paused px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-timer-paused/25 transition-all duration-200 hover:shadow-xl hover:shadow-timer-paused/30 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <PauseIcon />
                Pausar
              </button>
            ) : (
              <button
                id="btn-retomar"
                onClick={timer.retomar}
                className="inline-flex items-center gap-2 rounded-2xl bg-timer-running px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-timer-running/25 transition-all duration-200 hover:shadow-xl hover:shadow-timer-running/30 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <PlayIcon />
                Retomar
              </button>
            )}

            {/* PARAR */}
            <button
              id="btn-parar"
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
      {!atividadeId && !timer.isActive && (
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
