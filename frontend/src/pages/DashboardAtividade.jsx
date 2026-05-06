import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as atividadesApi from "../api/atividades.js";
import * as pastasApi from "../api/pastas.js";
import * as dashboardApi from "../api/dashboard.js";
import { GradeKpis } from "../components/dashboard/GradeKpis.jsx";
import { HeatmapAnual } from "../components/dashboard/HeatmapAnual.jsx";
import { DonutDistribuicao } from "../components/dashboard/DonutDistribuicao.jsx";
import { EvolucaoArea } from "../components/dashboard/EvolucaoArea.jsx";
import { PorHoraBar } from "../components/dashboard/PorHoraBar.jsx";
import { PorDiaSemanaBar } from "../components/dashboard/PorDiaSemanaBar.jsx";
import { PorModoDonut } from "../components/dashboard/PorModoDonut.jsx";
import Spinner from "../components/ui/Spinner.jsx";

const KPIS_VAZIOS = {
  totalSegundos: 0,
  totalSessoes: 0,
  streakAtual: 0,
  melhorStreak: 0,
};

export default function DashboardAtividade() {
  const { atividadeId } = useParams();
  const [atividade, setAtividade] = useState(null);
  const [pasta, setPasta] = useState(null);
  const [kpis, setKpis] = useState(KPIS_VAZIOS);
  const [heatmap, setHeatmap] = useState([]);
  const [distribuicao, setDistribuicao] = useState({ nivel: "categoria", itens: [] });
  const [evolucao, setEvolucao] = useState([]);
  const [porHora, setPorHora] = useState([]);
  const [porDiaSemana, setPorDiaSemana] = useState([]);
  const [porModo, setPorModo] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      atividadesApi.buscar(atividadeId),
      dashboardApi.kpis({ atividadeId }),
      dashboardApi.heatmap({ atividadeId }),
      dashboardApi.distribuicao({ atividadeId }),
      dashboardApi.evolucao({ atividadeId }),
      dashboardApi.porHora({ atividadeId }),
      dashboardApi.porDiaSemana({ atividadeId }),
      dashboardApi.porModo({ atividadeId }),
    ])
      .then(
        async ([
          atividadeRes,
          kpisRes,
          heatmapRes,
          distribuicaoRes,
          evolucaoRes,
          porHoraRes,
          porDiaSemanaRes,
          porModoRes,
        ]) => {
          if (cancelado) return;
          setAtividade(atividadeRes);
          setKpis(kpisRes);
          setHeatmap(heatmapRes);
          setDistribuicao(distribuicaoRes);
          setEvolucao(evolucaoRes);
          setPorHora(porHoraRes);
          setPorDiaSemana(porDiaSemanaRes);
          setPorModo(porModoRes);
          if (atividadeRes.pastaId) {
            const pastaRes = await pastasApi.buscar(atividadeRes.pastaId);
            if (!cancelado) setPasta(pastaRes);
          }
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
  }, [atividadeId]);

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
      <div className="flex flex-wrap items-center gap-2">
        {pasta ? (
          <Link
            to={`/pastas/${pasta.id}/dashboard`}
            className="text-sm text-text-muted hover:text-accent"
          >
            ← {pasta.nome}
          </Link>
        ) : (
          <Link to="/" className="text-sm text-text-muted hover:text-accent">
            ← Dashboard geral
          </Link>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold">{atividade?.nome ?? ""}</h2>
        {pasta ? (
          <p className="text-sm text-text-muted">{pasta.nome}</p>
        ) : null}
      </div>

      <GradeKpis kpis={kpis} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Cartao titulo="Atividade no último ano">
          {heatmap.length > 0 ? (
            <HeatmapAnual dados={heatmap} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
        <Cartao titulo="Por categoria">
          {distribuicao.itens.length > 0 ? (
            <DonutDistribuicao itens={distribuicao.itens} />
          ) : (
            <PlaceholderVazio />
          )}
        </Cartao>
      </div>

      <Cartao titulo="Evolução (últimos 30 dias)">
        {evolucao.length > 0 ? (
          <EvolucaoArea dados={evolucao} />
        ) : (
          <PlaceholderVazio />
        )}
      </Cartao>

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
