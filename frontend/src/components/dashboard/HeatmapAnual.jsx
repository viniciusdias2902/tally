import { useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const TEMA_HEATMAP = {
  light: ["#ccd0da", "#8839ef"],
  dark: ["#313244", "#cba6f7"],
};

function calcularLevel(count, maximo) {
  if (count <= 0) return 0;
  if (maximo <= 0) return 0;
  const proporcao = count / maximo;
  if (proporcao > 0.75) return 4;
  if (proporcao > 0.5) return 3;
  if (proporcao > 0.25) return 2;
  return 1;
}

export function HeatmapAnual({ dados }) {
  const { theme } = useTheme();
  const data = useMemo(() => {
    if (!dados || dados.length === 0) return [];
    const maximo = Math.max(...dados.map((d) => d.count));
    return dados.map((d) => ({
      date: d.date,
      count: d.count,
      level: calcularLevel(d.count, maximo),
    }));
  }, [dados]);

  return (
    <ActivityCalendar
      data={data}
      maxLevel={4}
      weekStart={0}
      showWeekdayLabels
      blockSize={12}
      blockMargin={3}
      blockRadius={2}
      colorScheme={theme}
      theme={TEMA_HEATMAP}
    />
  );
}
