import { useEffect, useState } from "react";
import { GradeKpis } from "../components/dashboard/GradeKpis.jsx";
import { HeatmapAnual } from "../components/dashboard/HeatmapAnual.jsx";
import { DonutDistribuicao } from "../components/dashboard/DonutDistribuicao.jsx";
import { EvolucaoArea } from "../components/dashboard/EvolucaoArea.jsx";
import { TopAtividadesBar } from "../components/dashboard/TopAtividadesBar.jsx";
import { PorHoraBar } from "../components/dashboard/PorHoraBar.jsx";
import { PorDiaSemanaBar } from "../components/dashboard/PorDiaSemanaBar.jsx";
import { PorModoDonut } from "../components/dashboard/PorModoDonut.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import * as dashboardApi from "../api/dashboard.js";

const KPIS_VAZIOS = {
  totalSegundos: 0,
  totalSessoes: 0,
  streakAtual: 0,
  melhorStreak: 0,
};

export default function Dashboard() {
  const [kpis, setKpis] = useState(KPIS_VAZIOS);
  const [heatmap, setHeatmap] = useState([]);
  const [distribuicao, setDistribuicao] = useState({ nivel: "pasta", itens: [] });
  const [evolucao, setEvolucao] = useState([]);
  const [topAtividades, setTopAtividades] = useState([]);
  const [porHora, setPorHora] = useState([]);
  const [porDiaSemana, setPorDiaSemana] = useState([]);
  const [porModo, setPorModo] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      dashboardApi.kpis(),
      dashboardApi.heatmap(),
      dashboardApi.distribuicao(),
      dashboardApi.evolucao(),
      dashboardApi.topAtividades(),
      dashboardApi.porHora(),
      dashboardApi.porDiaSemana(),
      dashboardApi.porModo(),
    ])
      .then(
        ([
          kpisRes,
          heatmapRes,
          distribuicaoRes,
          evolucaoRes,
          topRes,
          porHoraRes,
          porDiaSemanaRes,
          porModoRes,
        ]) => {
          if (cancelado) return;
          setKpis(kpisRes);
          setHeatmap(heatmapRes);
          setDistribuicao(distribuicaoRes);
          setEvolucao(evolucaoRes);
          setTopAtividades(topRes);
          setPorHora(porHoraRes);
          setPorDiaSemana(porDiaSemanaRes);
          setPorModo(porModoRes);
        },
      )
      .catch(() => {
        if (!cancelado) setErro("Erro ao carregar dashboard.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-danger">{erro}</p>
      </div>
    );
  }

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
            <DonutDistribuicao
              itens={distribuicao.itens}
              rotaParaItem={(item) =>
                item.pastaId ? `/pastas/${item.pastaId}/dashboard` : null
              }
            />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Cartao titulo="Evolução (últimos 30 dias)">
          {evolucao.length > 0 ? (
            <EvolucaoArea dados={evolucao} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
        <Cartao titulo="Top atividades">
          {topAtividades.length > 0 ? (
            <TopAtividadesBar dados={topAtividades} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Cartao titulo="Por hora do dia">
          {porHora.length > 0 ? (
            <PorHoraBar dados={porHora} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
        <Cartao titulo="Por dia da semana">
          {porDiaSemana.length > 0 ? (
            <PorDiaSemanaBar dados={porDiaSemana} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
        <Cartao titulo="Por modo">
          {porModo.length > 0 ? (
            <PorModoDonut dados={porModo} />
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
