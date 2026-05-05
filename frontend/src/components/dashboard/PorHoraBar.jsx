import { useMemo } from "react";
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
  const hora = String(ponto.payload.hora).padStart(2, "0");
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-text-primary">{hora}h</p>
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(ponto.value)}
      </p>
    </div>
  );
}

export function PorHoraBar({ dados }) {
  const tema = useTemaGrafico();
  const dadosCompletos = useMemo(() => {
    const mapa = new Map((dados ?? []).map((d) => [d.hora, d.totalSegundos]));
    return Array.from({ length: 24 }, (_, hora) => ({
      hora,
      totalSegundos: mapa.get(hora) ?? 0,
    }));
  }, [dados]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dadosCompletos}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={tema.grid} vertical={false} />
          <XAxis
            dataKey="hora"
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: tema.grid }}
            interval={2}
            tickFormatter={(h) => `${h}h`}
          />
          <YAxis
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(s) => formatarDuracaoHumana(s)}
            width={56}
          />
          <Tooltip cursor={{ fill: tema.grid, opacity: 0.4 }} content={<ConteudoTooltip />} />
          <Bar dataKey="totalSegundos" fill={tema.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
