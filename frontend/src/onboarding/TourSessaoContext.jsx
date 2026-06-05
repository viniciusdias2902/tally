// Tour guiado por ação implementado sem react-joyride.
//
// Por que custom? A overlay do Joyride v3 tem `pointer-events: auto`
// hardcoded no `<path>` SVG que cobre a tela. Mesmo com o spotlight
// "vazio", o SVG inteiro intercepta cliques na área do recorte em vários
// cenários, deixando o tour travado.
//
// Aqui usamos o truque clássico de box-shadow gigantesco: uma `div`
// posicionada em volta do alvo com `box-shadow: 0 0 0 9999px rgba(...)`
// e `pointer-events: none`. A "overlay" escura é a sombra dessa div — não
// há nenhum elemento DOM cobrindo o alvo, então cliques sempre chegam nele.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { passosTourSessao } from "./passosTourSessao.jsx";

const TourSessaoContext = createContext(null);

const TIMEOUT_AGUARDAR = 6000;

// Espera o elemento aparecer no DOM. Resolve com o elemento, ou null no timeout.
function aguardarElemento(seletor, timeout = TIMEOUT_AGUARDAR) {
  return new Promise((resolve) => {
    if (!seletor || seletor === "body") {
      resolve(document.body);
      return;
    }
    const inicio = Date.now();
    const tentar = () => {
      const el = document.querySelector(seletor);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - inicio >= timeout) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tentar);
    };
    tentar();
  });
}

export function TourSessaoProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [ativo, setAtivo] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [novaAtividadeId, setNovaAtividadeId] = useState(null);

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const passos = useMemo(
    () => passosTourSessao({ novaAtividadeId }),
    [novaAtividadeId],
  );

  const passoAtual = ativo ? passos[indiceAtual] : null;
  const ehUltimo = indiceAtual === passos.length - 1;

  const finalizar = useCallback(() => {
    setAtivo(false);
    setIndiceAtual(0);
    setNovaAtividadeId(null);
  }, []);

  const avancar = useCallback(() => {
    setIndiceAtual((i) => i + 1);
  }, []);

  const iniciar = useCallback(async () => {
    setNovaAtividadeId(null);
    if (locationRef.current.pathname !== "/atividades") {
      navigate("/atividades");
    }
    // Espera o botão "Nova atividade" antes de começar — assim o passo 1
    // não fica esperando o alvo aparecer com a tela em estado intermediário.
    await aguardarElemento('[data-tour="nova-atividade"]');
    setIndiceAtual(0);
    setAtivo(true);
  }, [navigate]);

  // Finaliza se o índice passar do último passo
  useEffect(() => {
    if (ativo && indiceAtual >= passos.length) {
      finalizar();
    }
  }, [ativo, indiceAtual, passos.length, finalizar]);

  // Pré-navegação ao entrar em um passo (rota fixa ou dinâmica)
  useEffect(() => {
    if (!passoAtual) return;
    if (passoAtual.rota && location.pathname !== passoAtual.rota) {
      navigate(passoAtual.rota);
    } else if (passoAtual.rotaDinamica) {
      const destino = passoAtual.rotaDinamica({ novaAtividadeId });
      if (destino && location.pathname !== destino) {
        navigate(destino);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passoAtual]);

  // Avanço por CustomEvent (atividade-criada, sessao-criada)
  useEffect(() => {
    if (!passoAtual?.aguardar) return;
    const { tipo, nome, capturar } = passoAtual.aguardar;
    if (tipo !== "evento") return;

    function handler(e) {
      if (capturar === "novaAtividadeId" && e?.detail?.atividade?.id) {
        setNovaAtividadeId(e.detail.atividade.id);
      }
      avancar();
    }
    window.addEventListener(nome, handler);
    return () => window.removeEventListener(nome, handler);
  }, [passoAtual, avancar]);

  // Avanço quando um elemento aparece no DOM (ex.: modal abriu)
  useEffect(() => {
    if (!passoAtual?.aguardar) return;
    const { tipo, seletor } = passoAtual.aguardar;
    if (tipo !== "dom") return;

    let cancelado = false;
    const tentar = () => {
      if (cancelado) return;
      if (document.querySelector(seletor)) {
        avancar();
        return;
      }
      requestAnimationFrame(tentar);
    };
    tentar();
    return () => {
      cancelado = true;
    };
  }, [passoAtual, avancar]);

  // Avanço por mudança de rota — espera o alvo do próximo passo aparecer
  // antes de avançar, pra evitar transição com a tela "no meio do caminho".
  useEffect(() => {
    if (!passoAtual?.aguardar) return;
    if (passoAtual.aguardar.tipo !== "rota") return;
    if (!passoAtual.aguardar.padrao.test(location.pathname)) return;

    const proximoPasso = passos[indiceAtual + 1];
    if (!proximoPasso) {
      avancar();
      return;
    }
    let cancelado = false;
    aguardarElemento(proximoPasso.target).then(() => {
      if (!cancelado) avancar();
    });
    return () => {
      cancelado = true;
    };
  }, [passoAtual, location.pathname, passos, indiceAtual, avancar]);

  return (
    <TourSessaoContext.Provider value={{ iniciar, ativo }}>
      {children}
      {passoAtual && (
        <TourOverlay
          // remonta o overlay quando o passo ou a rota muda — assim o spotlight
          // não fica preso em coordenadas velhas quando o alvo some do DOM
          key={`${indiceAtual}@${location.pathname}`}
          passo={passoAtual}
          ehUltimo={ehUltimo}
          onPular={finalizar}
          onProximo={passoAtual.aguardar ? null : avancar}
        />
      )}
    </TourSessaoContext.Provider>
  );
}

export function useTourSessao() {
  const ctx = useContext(TourSessaoContext);
  if (!ctx)
    throw new Error("useTourSessao deve ser usado dentro de TourSessaoProvider");
  return ctx;
}

// ───────────────────── Componentes visuais ─────────────────────

function TourOverlay({ passo, ehUltimo, onPular, onProximo }) {
  if (passo.placement === "center") {
    return (
      <CartaoCentralizado
        passo={passo}
        ehUltimo={ehUltimo}
        onPular={onPular}
        onProximo={onProximo}
      />
    );
  }
  return <SpotlightAncorado passo={passo} onPular={onPular} />;
}

function CartaoCentralizado({ passo, ehUltimo, onPular, onProximo }) {
  // No último passo, "Concluir" fecha o tour (não tem próximo).
  // Se for o primeiro/intro, tem Próximo separado e Pular discreto.
  const corpo = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-bg-elevated p-6 shadow-2xl animate-fade-slide-in">
        <h3 className="mb-3 text-base font-semibold text-text-primary">
          {passo.title}
        </h3>
        <div className="mb-6 text-sm text-text-secondary leading-relaxed">
          {passo.content}
        </div>
        <div className="flex items-center justify-between gap-3">
          {!ehUltimo ? (
            <>
              <button
                type="button"
                onClick={onPular}
                className="text-xs text-text-muted hover:text-text-secondary"
              >
                Pular tour
              </button>
              <button
                type="button"
                onClick={onProximo}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
              >
                Próximo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onPular}
              className="ml-auto rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(corpo, document.body);
}

function SpotlightAncorado({ passo, onPular }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    let cancelado = false;
    let rafId = null;
    let resizeObserver = null;

    function ler() {
      const el = document.querySelector(passo.target);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
        right: r.right,
      };
    }

    function recalcular() {
      const novo = ler();
      if (novo) setRect(novo);
    }

    function tentar() {
      if (cancelado) return;
      const el = document.querySelector(passo.target);
      if (!el) {
        rafId = requestAnimationFrame(tentar);
        return;
      }
      const r = el.getBoundingClientRect();
      // Scroll suave se o alvo estiver fora da viewport
      const foraDaTela =
        r.top < 0 ||
        r.bottom > window.innerHeight ||
        r.left < 0 ||
        r.right > window.innerWidth;
      if (foraDaTela) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Observa mudanças de tamanho do próprio alvo (ex.: trocar de modo
      // Timer/Pomodoro/Manual altera a altura do painel de registro).
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(recalcular);
        resizeObserver.observe(el);
      }
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
        right: r.right,
      });
    }
    tentar();

    window.addEventListener("resize", recalcular);
    window.addEventListener("scroll", recalcular, true);
    return () => {
      cancelado = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", recalcular);
      window.removeEventListener("scroll", recalcular, true);
    };
  }, [passo.target]);

  if (!rect) return null;

  const p = 6;
  return createPortal(
    <>
      {/* Spotlight: box-shadow gigante = "overlay" escura sem bloquear cliques.
          pointer-events: none = cliques no alvo passam normalmente. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: rect.top - p,
          left: rect.left - p,
          width: rect.width + p * 2,
          height: rect.height + p * 2,
          borderRadius: 12,
          boxShadow:
            "0 0 0 9999px rgba(17,17,27,0.55), 0 0 0 3px rgba(136,57,239,0.9)",
          pointerEvents: "none",
          zIndex: 999,
          transition: "top 0.2s, left 0.2s, width 0.2s, height 0.2s",
        }}
      />
      <TooltipCard rect={rect} passo={passo} onPular={onPular} />
    </>,
    document.body,
  );
}

function TooltipCard({ rect, passo, onPular }) {
  const LARGURA = 360;
  const margem = 14;
  const ALTURA_ESTIMADA = 220; // altura típica do card; usada só pra decidir lado

  const placementResolvido = useMemo(() => {
    const espacoAcima = rect.top;
    const espacoAbaixo = window.innerHeight - rect.bottom;
    const preferido = passo.placement || "auto";

    function escolher(primario, secundario) {
      // Tenta o primário; se não couber, tenta o secundário; senão, fica com
      // quem tiver mais espaço.
      const espacoPrim = primario === "top" ? espacoAcima : espacoAbaixo;
      const espacoSec = secundario === "top" ? espacoAcima : espacoAbaixo;
      if (espacoPrim >= ALTURA_ESTIMADA) return primario;
      if (espacoSec >= ALTURA_ESTIMADA) return secundario;
      return espacoPrim >= espacoSec ? primario : secundario;
    }

    if (preferido === "top") return escolher("top", "bottom");
    if (preferido === "bottom") return escolher("bottom", "top");
    // auto: escolhe o lado com mais espaço
    return espacoAbaixo >= espacoAcima ? "bottom" : "top";
  }, [rect, passo.placement]);

  const estiloPos = useMemo(() => {
    const meioX = rect.left + rect.width / 2;
    let left = meioX - LARGURA / 2;
    left = Math.max(8, Math.min(window.innerWidth - LARGURA - 8, left));

    if (placementResolvido === "top") {
      // Ancora pelo bottom — assim o card cresce pra cima sem precisar saber
      // a altura exata. Garante que não saia da viewport com max bottom.
      let bottom = window.innerHeight - rect.top + margem;
      bottom = Math.max(8, bottom);
      return {
        position: "fixed",
        left,
        bottom,
        maxHeight: `calc(100vh - ${bottom + 8}px)`,
        width: LARGURA,
        zIndex: 1001,
        overflowY: "auto",
      };
    }
    let top = rect.bottom + margem;
    top = Math.max(8, top);
    return {
      position: "fixed",
      left,
      top,
      maxHeight: `calc(100vh - ${top + 8}px)`,
      width: LARGURA,
      zIndex: 1001,
      overflowY: "auto",
    };
  }, [rect, placementResolvido]);

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={estiloPos}
      className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-2xl animate-fade-slide-in"
    >
      <h3 className="mb-2 text-base font-semibold text-text-primary">
        {passo.title}
      </h3>
      <div className="mb-4 text-sm text-text-secondary leading-relaxed">
        {passo.content}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onPular}
          className="text-xs text-text-muted hover:text-text-secondary"
        >
          Pular tour
        </button>
      </div>
    </div>
  );
}
