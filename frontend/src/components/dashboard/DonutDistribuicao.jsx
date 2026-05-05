import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { corCategorica } from "./paleta-graficos.js";

export function DonutDistribuicao({ itens }) {
  const { theme } = useTheme();

  return (
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
              <Cell
                key={item.id ?? item.nome}
                fill={item.cor ?? corCategorica(indice, theme)}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
