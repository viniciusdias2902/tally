import { useState } from "react";
import { GradeKpis } from "../components/dashboard/GradeKpis.jsx";
import { HeatmapAnual } from "../components/dashboard/HeatmapAnual.jsx";
import { DonutDistribuicao } from "../components/dashboard/DonutDistribuicao.jsx";

const KPIS_VAZIOS = {
  totalSegundos: 0,
  totalSessoes: 0,
  streakAtual: 0,
  melhorStreak: 0,
};

export default function Dashboard() {
  const [kpis] = useState(KPIS_VAZIOS);
  const [heatmap] = useState([]);
  const [distribuicao] = useState({ nivel: "pasta", itens: [] });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <GradeKpis kpis={kpis} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Cartao titulo="Atividade no último ano">
          {heatmap.length > 0 ? (
            <HeatmapAnual dados={heatmap} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
        <Cartao titulo="Distribuição">
          {distribuicao.itens.length > 0 ? (
            <DonutDistribuicao itens={distribuicao.itens} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
      </div>
    </div>
  );
}

function Cartao({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
        {titulo}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlaceholderVazio() {
  return (
    <p className="py-8 text-center text-sm text-text-muted">Sem dados ainda.</p>
  );
}
