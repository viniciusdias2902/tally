import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const BLOCK_MARGIN = 3;
const LARGURA_RESERVADA_LABELS = 36;
const SEMANAS = 53;
const BLOCK_MIN = 9;
const BLOCK_MAX = 18;

const TEMA_HEATMAP = {
  light: ["#ccd0da", "#8839ef"],
  dark: ["#313244", "#cba6f7"],
};

const LABELS = {
  months: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ],
  weekdays: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  totalCount: "{{count}} minutos rastreados em {{year}}",
  legend: { less: "menos", more: "mais" },
};

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

function formatarDataCurta(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return FORMATADOR_DATA.format(new Date(ano, mes - 1, dia));
}

function formatarMinutos(min) {
  if (!min) return "0 min";
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

function textoTooltip({ count, date }) {
  return `${formatarMinutos(count)} em ${formatarDataCurta(date)}`;
}

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
  const containerRef = useRef(null);
  const [blockSize, setBlockSize] = useState(12);
  const data = useMemo(() => {
    if (!dados || dados.length === 0) return [];
    const maximo = Math.max(...dados.map((d) => d.count));
    return dados.map((d) => ({
      date: d.date,
      count: d.count,
      level: calcularLevel(d.count, maximo),
    }));
  }, [dados]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calcular = (largura) => {
      const disponivel = largura - LARGURA_RESERVADA_LABELS;
      const tamanho = Math.floor(disponivel / SEMANAS) - BLOCK_MARGIN;
      return Math.max(BLOCK_MIN, Math.min(BLOCK_MAX, tamanho));
    };
    setBlockSize(calcular(el.clientWidth));
    const obs = new ResizeObserver(([entry]) => {
      setBlockSize(calcular(entry.contentRect.width));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <ActivityCalendar
        data={data}
        maxLevel={4}
        weekStart={0}
        showWeekdayLabels
        blockSize={blockSize}
        blockMargin={BLOCK_MARGIN}
        blockRadius={2}
        colorScheme={theme}
        theme={TEMA_HEATMAP}
        labels={LABELS}
        tooltips={{ activity: { text: textoTooltip } }}
      />
    </div>
  );
}
