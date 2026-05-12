import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { corCategorica } from "./paleta-graficos.js";
import { formatarDuracaoHumana } from "../../utils/formatarDuracaoHumana.js";

function ConteudoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const navegavel = item.payload.__navegavel;
  return (
    <div className="rounded-lg border border-border bg-bg-popover px-3 py-2 text-sm shadow-md">
      <p className="flex items-center gap-2 font-medium text-text-primary">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: item.payload.fill ?? item.color }}
        />
        {item.name}
      </p>
      <p className="mt-0.5 tabular-nums text-text-secondary">
        {formatarDuracaoHumana(item.value)}
      </p>
      {navegavel ? (
        <p className="mt-1 text-xs text-text-muted">Clique para detalhar →</p>
      ) : null}
    </div>
  );
}

export function DonutDistribuicao({ itens, rotaParaItem }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const cores = itens.map((item, indice) => item.cor ?? corCategorica(indice, theme));
  const itensComMeta = itens.map((item) => ({
    ...item,
    __navegavel: rotaParaItem ? Boolean(rotaParaItem(item)) : false,
  }));

  function navegarPara(item) {
    if (!rotaParaItem) return;
    const rota = rotaParaItem(item);
    if (rota) navigate(rota);
  }

  return (
    <div className="@container grid grid-cols-1 gap-4 @md:grid-cols-[minmax(0,1fr)_auto] @md:items-center">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={itensComMeta}
              dataKey="totalSegundos"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
              onClick={(_, indice) => navegarPara(itens[indice])}
              cursor={rotaParaItem ? "pointer" : "default"}
            >
              {itens.map((item, indice) => (
                <Cell key={item.id ?? item.nome} fill={cores[indice]} />
              ))}
            </Pie>
            <Tooltip content={<ConteudoTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm @md:min-w-44">
        {itens.map((item, indice) => {
          const rota = rotaParaItem ? rotaParaItem(item) : null;
          const conteudo = (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: cores[indice] }}
                />
                <span className="truncate text-text-primary">{item.nome}</span>
              </span>
              <span className="tabular-nums text-text-secondary">
                {formatarDuracaoHumana(item.totalSegundos)}
              </span>
            </>
          );
          return (
            <li
              key={item.id ?? item.nome}
              className="flex items-center justify-between gap-3"
            >
              {rota ? (
                <button
                  type="button"
                  onClick={() => navigate(rota)}
                  className="flex w-full items-center justify-between gap-3 rounded text-left hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {conteudo}
                </button>
              ) : (
                conteudo
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
