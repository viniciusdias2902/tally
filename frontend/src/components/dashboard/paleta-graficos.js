export const PALETA_LIGHT = [
  "#8839ef", // Mauve
  "#1e66f5", // Blue
  "#40a02b", // Green
  "#df8e1d", // Yellow
  "#fe640b", // Peach
  "#179299", // Teal
  "#ea76cb", // Pink
  "#7287fd", // Lavender
];

export const PALETA_DARK = [
  "#cba6f7", // Mauve
  "#89b4fa", // Blue
  "#a6e3a1", // Green
  "#f9e2af", // Yellow
  "#fab387", // Peach
  "#94e2d5", // Teal
  "#f5c2e7", // Pink
  "#b4befe", // Lavender
];

export function corCategorica(indice, tema) {
  const paleta = tema === "dark" ? PALETA_DARK : PALETA_LIGHT;
  return paleta[indice % paleta.length];
}
