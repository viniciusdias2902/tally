import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Joyride, STATUS } from "react-joyride";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { PASSOS } from "./passosTour.jsx";
import { CHAVE_PENDENTE, chaveConcluido } from "./armazenamento.js";

const OnboardingContext = createContext(null);

const LOCALE_PT = {
  back: "Voltar",
  skip: "Pular tour",
  next: "Próximo",
  last: "Concluir",
  nextWithProgress: "Próximo ({current}/{total})",
};

// Aguarda um elemento aparecer no DOM (após navegação/carregamento) antes de
// liberar o passo. Resolve no timeout para nunca travar o tour.
function aguardarElemento(seletor, timeout = 4500) {
  return new Promise((resolve) => {
    if (!seletor || seletor === "body") {
      resolve();
      return;
    }
    const inicio = Date.now();
    const tentar = () => {
      if (document.querySelector(seletor) || Date.now() - inicio >= timeout) {
        resolve();
        return;
      }
      requestAnimationFrame(tentar);
    };
    tentar();
  });
}

function construirTema(escuro) {
  const cor = escuro
    ? {
        fundo: "#1e1e2e",
        texto: "#cdd6f4",
        accent: "#cba6f7",
        borda: "#313244",
      }
    : {
        fundo: "#ffffff",
        texto: "#4c4f69",
        accent: "#8839ef",
        borda: "#ccd0da",
      };

  const opcoes = {
    skipBeacon: true,
    blockTargetInteraction: true,
    overlayClickAction: false,
    closeButtonAction: "skip",
    targetWaitTimeout: 6000,
    spotlightPadding: 8,
    spotlightRadius: 12,
    zIndex: 1000,
    width: 400,
    buttons: ["skip", "back", "primary"],
    backgroundColor: cor.fundo,
    arrowColor: cor.fundo,
    textColor: cor.texto,
    primaryColor: cor.accent,
    overlayColor: escuro ? "rgba(0,0,0,0.6)" : "rgba(17,17,27,0.4)",
  };

  const estilos = {
    tooltip: {
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${cor.borda}`,
      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
    },
    tooltipTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
    tooltipContent: { fontSize: 14, lineHeight: 1.55, textAlign: "left", padding: 0 },
    buttonPrimary: {
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      padding: "8px 16px",
      color: escuro ? "#1e1e2e" : "#ffffff",
    },
    buttonBack: { fontSize: 14, marginRight: 8, color: cor.texto },
    buttonSkip: { fontSize: 13, color: escuro ? "#7f849c" : "#8c8fa1" },
  };

  return { opcoes, estilos };
}

export function OnboardingProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { autenticado, usuario } = useAuth();
  const { theme } = useTheme();

  const [executando, setExecutando] = useState(false);
  const [execucaoId, setExecucaoId] = useState(0);

  // Rota atual sem o basename, lida dentro do hook `before` de cada passo.
  const rotaRef = useRef(location.pathname);
  useEffect(() => {
    rotaRef.current = location.pathname;
  }, [location.pathname]);

  // Garante que o disparo automático aconteça uma única vez por montagem.
  const jaDisparou = useRef(false);

  const finalizar = useCallback(() => {
    setExecutando(false);
    if (usuario?.id) localStorage.setItem(chaveConcluido(usuario.id), "1");
    localStorage.removeItem(CHAVE_PENDENTE);
  }, [usuario]);

  const iniciar = useCallback(() => {
    // Remonta o Joyride (key nova) para sempre recomeçar do passo 0.
    setExecutando(false);
    setExecucaoId((n) => n + 1);
    requestAnimationFrame(() => setExecutando(true));
  }, []);

  // Dispara automaticamente para contas novas (flag setada no registro).
  useEffect(() => {
    if (!autenticado || !usuario?.id || jaDisparou.current) return;
    const pendente = localStorage.getItem(CHAVE_PENDENTE) === "1";
    const concluido = localStorage.getItem(chaveConcluido(usuario.id)) === "1";
    if (pendente && !concluido) {
      jaDisparou.current = true;
      iniciar();
    }
  }, [autenticado, usuario, iniciar]);

  // Cada passo navega para sua rota (se necessário) e espera o alvo montar.
  const passos = useMemo(
    () =>
      PASSOS.map((passo) => ({
        ...passo,
        before: async () => {
          if (passo.rota && rotaRef.current !== passo.rota) {
            navigate(passo.rota);
          }
          await aguardarElemento(passo.target);
        },
      })),
    [navigate],
  );

  const { opcoes, estilos } = useMemo(
    () => construirTema(theme === "dark"),
    [theme],
  );

  const aoEvento = useCallback(
    (data) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        finalizar();
      }
    },
    [finalizar],
  );

  return (
    <OnboardingContext.Provider value={{ iniciar, executando }}>
      {children}
      <Joyride
        key={execucaoId}
        run={executando}
        steps={passos}
        continuous
        showProgress
        scrollToFirstStep
        onEvent={aoEvento}
        options={opcoes}
        locale={LOCALE_PT}
        styles={estilos}
      />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding deve ser usado dentro de OnboardingProvider");
  return context;
}
