import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { corCategorica } from "./paleta-graficos.js";
import { formatarDuracaoHumana } from "../../utils/formatarDuracaoHumana.js";

const ROTULOS = {
  timer: "Timer",
  pomodoro: "Pomodoro",
  manual: "Manual",
  check_binario: "Check binário",
};

function ConteudoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="flex items-center gap-2 font-medium text-text-primary">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: item.payload.fill ?? item.color }}
        />
        {item.payload.rotulo}
      </p>
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(item.value)} · {item.payload.totalSessoes} sessões
      </p>
    </div>
  );
}

export function PorModoDonut({ dados }) {
  const { theme } = useTheme();
  const itens = useMemo(
    () =>
      (dados ?? []).map((d) => ({
        ...d,
        rotulo: ROTULOS[d.modo] ?? d.modo,
      })),
    [dados],
  );
  const cores = itens.map((_, i) => corCategorica(i, theme));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={itens}
              dataKey="totalSegundos"
              nameKey="rotulo"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {itens.map((item, indice) => (
                <Cell key={item.modo} fill={cores[indice]} />
              ))}
            </Pie>
            <Tooltip content={<ConteudoTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-xs sm:min-w-32">
        {itens.map((item, indice) => (
          <li key={item.modo} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: cores[indice] }}
            />
            <span className="truncate text-text-secondary">{item.rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
