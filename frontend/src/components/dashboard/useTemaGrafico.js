import { useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const TEMA_LIGHT = {
  textoPrimario: "#4c4f69",
  textoSecundario: "#5c5f77",
  textoMuted: "#8c8fa1",
  grid: "#ccd0da",
  eixo: "#8c8fa1",
  tooltipBg: "#ffffff",
  tooltipBorda: "#ccd0da",
  accent: "#8839ef",
};

const TEMA_DARK = {
  textoPrimario: "#cdd6f4",
  textoSecundario: "#bac2de",
  textoMuted: "#7f849c",
  grid: "#313244",
  eixo: "#7f849c",
  tooltipBg: "#45475a",
  tooltipBorda: "#313244",
  accent: "#cba6f7",
};

export function useTemaGrafico() {
  const { theme } = useTheme();
  return useMemo(() => (theme === "dark" ? TEMA_DARK : TEMA_LIGHT), [theme]);
}
