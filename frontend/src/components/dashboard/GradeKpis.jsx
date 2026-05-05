import { CardKpi } from "./CardKpi.jsx";

export function GradeKpis({ kpis }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <CardKpi titulo="Tempo total" valor={kpis.totalSegundos} sufixo="s" />
      <CardKpi titulo="Sessões" valor={kpis.totalSessoes} />
      <CardKpi titulo="Sequência atual" valor={kpis.streakAtual} sufixo="dias" />
      <CardKpi titulo="Melhor sequência" valor={kpis.melhorStreak} sufixo="dias" />
    </div>
  );
}
