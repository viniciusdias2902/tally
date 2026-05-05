import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTemaGrafico } from "./useTemaGrafico.js";
import { formatarDuracaoHumana } from "../../utils/formatarDuracaoHumana.js";

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

function formatarDataCurta(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-").map(Number);
  return FORMATADOR_DATA.format(new Date(ano, mes - 1, dia));
}

function ConteudoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const ponto = payload[0];
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-text-primary">
        {formatarDataCurta(ponto.payload.data)}
      </p>
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(ponto.value)}
      </p>
    </div>
  );
}

export function EvolucaoArea({ dados }) {
  const tema = useTemaGrafico();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="evolucaoGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tema.accent} stopOpacity={0.5} />
              <stop offset="100%" stopColor={tema.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tema.grid} vertical={false} />
          <XAxis
            dataKey="data"
            tickFormatter={formatarDataCurta}
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: tema.grid }}
            minTickGap={24}
          />
          <YAxis
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(s) => formatarDuracaoHumana(s)}
            width={56}
          />
          <Tooltip content={<ConteudoTooltip />} />
          <Area
            type="monotone"
            dataKey="totalSegundos"
            stroke={tema.accent}
            strokeWidth={2}
            fill="url(#evolucaoGradiente)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
