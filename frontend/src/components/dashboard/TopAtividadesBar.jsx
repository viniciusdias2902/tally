import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTemaGrafico } from "./useTemaGrafico.js";
import { formatarDuracaoHumana } from "../../utils/formatarDuracaoHumana.js";

function ConteudoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const ponto = payload[0];
  const { nome, pastaNome } = ponto.payload;
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-text-primary">{nome}</p>
      {pastaNome ? (
        <p className="text-xs text-text-muted">{pastaNome}</p>
      ) : null}
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(ponto.value)}
      </p>
    </div>
  );
}

export function TopAtividadesBar({ dados }) {
  const tema = useTemaGrafico();
  const altura = Math.max(160, (dados?.length ?? 0) * 36 + 24);

  return (
    <div className="w-full" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke={tema.grid} horizontal={false} />
          <XAxis
            type="number"
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: tema.grid }}
            tickFormatter={(s) => formatarDuracaoHumana(s)}
          />
          <YAxis
            type="category"
            dataKey="nome"
            stroke={tema.eixo}
            tick={{ fill: tema.textoSecundario, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip cursor={{ fill: tema.grid, opacity: 0.4 }} content={<ConteudoTooltip />} />
          <Bar dataKey="totalSegundos" fill={tema.accent} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
