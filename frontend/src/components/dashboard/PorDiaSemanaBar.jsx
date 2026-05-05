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

const NOMES_DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function ConteudoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const ponto = payload[0];
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-text-primary">
        {NOMES_DIAS[ponto.payload.diaSemana]}
      </p>
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(ponto.value)}
      </p>
    </div>
  );
}

export function PorDiaSemanaBar({ dados }) {
  const tema = useTemaGrafico();
  const dadosCompletos = useMemo(() => {
    const mapa = new Map((dados ?? []).map((d) => [d.diaSemana, d.totalSegundos]));
    return Array.from({ length: 7 }, (_, diaSemana) => ({
      diaSemana,
      totalSegundos: mapa.get(diaSemana) ?? 0,
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
            dataKey="diaSemana"
            stroke={tema.eixo}
            tick={{ fill: tema.textoMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: tema.grid }}
            tickFormatter={(d) => NOMES_DIAS[d]}
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
