import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { corCategorica } from "./paleta-graficos.js";
import { formatarDuracaoHumana } from "../../utils/formatarDuracaoHumana.js";

export function DonutDistribuicao({ itens }) {
  const { theme } = useTheme();
  const cores = itens.map((item, indice) => item.cor ?? corCategorica(indice, theme));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={itens}
              dataKey="totalSegundos"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {itens.map((item, indice) => (
                <Cell key={item.id ?? item.nome} fill={cores[indice]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm sm:min-w-44">
        {itens.map((item, indice) => (
          <li
            key={item.id ?? item.nome}
            className="flex items-center justify-between gap-3"
          >
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
          </li>
        ))}
      </ul>
    </div>
  );
}
