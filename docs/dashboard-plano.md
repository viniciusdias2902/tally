# Plano do Dashboard — Tally

> **Status:** planejado, não iniciado.
> **Última atualização:** 2026-05-05

## Como retomar este plano (instruções para a IA)

1. Leia este arquivo do início ao fim antes de fazer qualquer edição.
2. Localize a primeira tarefa `[ ]` não marcada — é por aí que você continua.
3. **Cada item do checklist = UM commit.** Granularidade é deliberada — não junte commits.
4. Convenções: conventional commits em pt-BR, **sem coautoria do Claude**, sem `--no-verify`.
5. Após **cada commit**, edite este arquivo trocando `[ ]` por `[x]` no item correspondente. Esse update do checklist pode entrar junto do commit que ele descreve (`git add docs/dashboard-plano.md`) ou ir num commit `docs(dashboard-plano): ...` separado — ambos servem, escolha o que ficar mais limpo no histórico.
6. Se uma tarefa virar irrelevante ou for absorvida por outra, marque `[~]` e adicione uma nota explicando.
7. Se descobrir uma sub-tarefa que faltou, **adicione** ao checklist no lugar correto antes de implementar.
8. Backend: testes integrados na pasta `__tests__` do módulo. Frontend: por enquanto sem teste unitário (segue o padrão do repo). E2E (Playwright) só no fim.

---

## Contexto

A página `Dashboard` (`frontend/src/pages/Dashboard.jsx`) hoje é um placeholder. O usuário quer:

- **Heatmap estilo GitHub** mostrando atividade diária ao longo do tempo.
- **Dashboard hierárquico**: visão geral, por pasta e por atividade — cada nível com drill-down.
- **Gráfico de "horas em subdivisão"**: na tela geral, distribuição por pasta; numa pasta, por atividade dentro dela; numa atividade, por categoria.
- **Outros gráficos essenciais** de um app de tracking de tempo (decisão minha — listados abaixo).

Backend atualmente **não** tem endpoints de agregação além de `GET /atividades/:id/sessoes/duracao`. Toda a camada de agregação vai ser nova (módulo `dashboard`).

## Pesquisa de bibliotecas (decisões tomadas)

Depois de pesquisar via Context7:

| Necessidade            | Biblioteca               | Por quê                                                                                                          |
|------------------------|--------------------------|------------------------------------------------------------------------------------------------------------------|
| Heatmap GitHub-style   | `react-activity-calendar`| Benchmark 80.5 / source High. Tema explícito light/dark, suporta levels customizáveis, tooltips, weekStart, etc. |
| Donut/Bar/Line/Area    | `recharts`               | Padrão React (94 snippets, benchmark 89, source High). Declarativo, SVG, ResponsiveContainer.                    |

Recharts **não** tem calendar heatmap nativo — daí a combinação com `react-activity-calendar`. As duas libs cobrem todos os gráficos planejados sem precisar de uma terceira.

## Gráficos do dashboard (decisões tomadas)

Cada escopo (geral, pasta, atividade) tem **a mesma estrutura visual**, com o conteúdo do gráfico de distribuição mudando conforme o nível.

### KPIs (cards no topo, 4 cards)

- Tempo total (no período selecionado: hoje / semana / mês / ano)
- Total de sessões
- Sequência atual (dias seguidos com pelo menos uma sessão)
- Melhor sequência

### Gráficos

1. **Heatmap anual** — atividade diária dos últimos 365 dias. (`react-activity-calendar`)
2. **Distribuição (donut)** — "horas em uma subdivisão":
   - Geral: por pasta (e atividades sem pasta como uma fatia "Sem pasta")
   - Pasta: por atividade dentro da pasta
   - Atividade: por categoria dentro da atividade (mais "Sem categoria" se houver)
3. **Evolução temporal (area chart)** — minutos por dia dos últimos 30 dias.
4. **Por hora do dia (bar chart)** — em que horas a pessoa mais foca (eixo X = 0–23, Y = minutos).
5. **Por dia da semana (bar chart)** — Y = minutos, X = seg–dom.
6. **Por modo de sessão (donut pequeno)** — timer / pomodoro / manual / check_binário.
7. **Top atividades (bar horizontal)** — só no escopo geral. Top 5–10 atividades.

### Drill-down

- Clicar numa fatia do donut leva para o dashboard daquele filho:
  - Geral → fatia "Estudos" → `/pastas/:id/dashboard`
  - Pasta → fatia "Concurso" → `/atividades/:id/dashboard`
  - Atividade → categorias não levam para nenhum nível abaixo (não existe sub-categoria)

### Hierarquia de rotas (frontend)

| Rota                               | Componente            |
|------------------------------------|-----------------------|
| `/`                                | `Dashboard` (geral)   |
| `/pastas/:pastaId/dashboard`       | `DashboardPasta`      |
| `/atividades/:atividadeId/dashboard` | `DashboardAtividade` |

A rota `/atividades/:id/sessoes` já existe — manter; o dashboard é uma rota irmã.

## Endpoints novos (backend)

Módulo novo: `backend/modules/dashboard/`. Filtro de escopo via query string para evitar explosão de rotas:

| Rota                            | Query                                | Retorno                                                                                  |
|---------------------------------|--------------------------------------|------------------------------------------------------------------------------------------|
| `GET /dashboard/kpis`           | `pastaId? \| atividadeId?`           | `{ totalSegundos, totalSessoes, streakAtual, melhorStreak }` (filtra pelo escopo)        |
| `GET /dashboard/heatmap`        | `pastaId? \| atividadeId? \| desdeDias?` (default 365) | `[{ date: "2026-04-01", count: 1234 }, ...]`                                |
| `GET /dashboard/distribuicao`   | `pastaId? \| atividadeId?`           | Geral: `[{ pastaId, nome, totalSegundos }]`. Pasta: `[{ atividadeId, nome, totalSegundos }]`. Atividade: `[{ categoriaId, nome, cor, totalSegundos }]`. |
| `GET /dashboard/evolucao`       | `pastaId? \| atividadeId? \| dias?` (default 30) | `[{ data, totalSegundos }, ...]`                                                          |
| `GET /dashboard/por-hora`       | `pastaId? \| atividadeId?`           | `[{ hora: 0..23, totalSegundos }]`                                                       |
| `GET /dashboard/por-dia-semana` | `pastaId? \| atividadeId?`           | `[{ diaSemana: 0..6, totalSegundos }]` (0 = domingo)                                     |
| `GET /dashboard/por-modo`       | `pastaId? \| atividadeId?`           | `[{ modo, totalSegundos, totalSessoes }]`                                                |
| `GET /dashboard/top-atividades` | `limite?` (default 8)                | `[{ atividadeId, nome, pastaNome, totalSegundos }]` — escopo só "geral"                  |

Implementação:
- Heatmap, evolução, por-hora e por-dia-semana exigem `GROUP BY` em uma coluna derivada de `iniciado_em`. Vou usar **`prisma.$queryRaw`** com `DATE_TRUNC` / `EXTRACT` para isso (postgres-puro). Isolar o SQL no `repository`.
- Validação dos query params via Zod no `dashboard.schemas.js`.
- Autorização: middleware `autenticar` já roda antes de `/dashboard` (igual o resto). Verificar `usuarioId` do JWT vs `pastaId`/`atividadeId` informados.

---

## Fases e checklist

### Fase 0 — Setup

- [x] `chore(frontend): instala recharts e react-activity-calendar`
- [x] `chore(frontend): cria diretório components/dashboard com index vazio`
- [x] `chore(backend): cria estrutura do módulo dashboard (arquivos vazios)`

### Fase 1 — Backend: heatmap

- [x] `feat(dashboard.repository): adiciona somarSegundosPorDia (raw SQL)`
- [x] `test(dashboard.repository): cobre somarSegundosPorDia geral`
- [x] `feat(dashboard.repository): aceita filtro pastaId em somarSegundosPorDia`
- [x] `test(dashboard.repository): cobre filtro por pasta em somarSegundosPorDia`
- [x] `feat(dashboard.repository): aceita filtro atividadeId em somarSegundosPorDia`
- [x] `test(dashboard.repository): cobre filtro por atividade em somarSegundosPorDia`
- [x] `feat(dashboard.service): adiciona gerarHeatmap`
- [x] `test(dashboard.service): cobre gerarHeatmap (preenchimento de dias zerados)`
- [x] `feat(dashboard.schemas): adiciona heatmapQuerySchema (Zod)`
- [x] `feat(dashboard.controller): adiciona handler heatmap`
- [x] `feat(dashboard.routes): registra GET /dashboard/heatmap`
- [x] `feat(app): wireup do módulo dashboard em app.js`
- [x] `test(dashboard.routes): cobre GET /dashboard/heatmap (integração)`
- [x] `docs(swagger): documenta GET /dashboard/heatmap`

### Fase 2 — Backend: KPIs

- [x] `feat(dashboard.repository): adiciona somarTotaisGerais (segundos+sessoes)`
- [x] `test(dashboard.repository): cobre somarTotaisGerais`
- [x] `feat(dashboard.repository): adiciona calcularStreaks (atual e melhor)`
- [x] `test(dashboard.repository): cobre calcularStreaks com sessões espaçadas`
- [x] `feat(dashboard.service): adiciona obterKpis`
- [x] `test(dashboard.service): cobre obterKpis nos 3 escopos`
- [x] `feat(dashboard.schemas): adiciona kpisQuerySchema`
- [x] `feat(dashboard.controller): adiciona handler kpis`
- [x] `feat(dashboard.routes): registra GET /dashboard/kpis`
- [x] `test(dashboard.routes): cobre GET /dashboard/kpis`
- [x] `docs(swagger): documenta GET /dashboard/kpis`

### Fase 3 — Backend: distribuição (donut)

- [x] `feat(dashboard.repository): adiciona somarPorPastaDoUsuario`
- [x] `test(dashboard.repository): cobre somarPorPastaDoUsuario`
- [x] `feat(dashboard.repository): adiciona somarPorAtividadeNaPasta`
- [x] `test(dashboard.repository): cobre somarPorAtividadeNaPasta`
- [x] `feat(dashboard.repository): adiciona somarPorCategoriaNaAtividade`
- [x] `test(dashboard.repository): cobre somarPorCategoriaNaAtividade`
- [x] `feat(dashboard.service): adiciona obterDistribuicao (decide nível pelo escopo)`
- [x] `test(dashboard.service): cobre obterDistribuicao (3 escopos)`
- [x] `feat(dashboard.schemas): adiciona distribuicaoQuerySchema`
- [x] `feat(dashboard.controller): adiciona handler distribuicao`
- [x] `feat(dashboard.routes): registra GET /dashboard/distribuicao`
- [x] `test(dashboard.routes): cobre GET /dashboard/distribuicao`
- [x] `docs(swagger): documenta GET /dashboard/distribuicao`

### Fase 4 — Backend: evolução temporal

- [~] `feat(dashboard.repository): adiciona somarSegundosPorDiaRecentes (limite N dias)` — absorvido por `somarSegundosPorDia` (já recebe `dataInicio/dataFim`); o service calcula as datas a partir do parâmetro `dias`.
- [~] `test(dashboard.repository): cobre somarSegundosPorDiaRecentes` — absorvido pelos testes existentes de `somarSegundosPorDia`.
- [x] `feat(dashboard.service): adiciona obterEvolucao`
- [x] `test(dashboard.service): cobre obterEvolucao`
- [x] `feat(dashboard.schemas): adiciona evolucaoQuerySchema`
- [x] `feat(dashboard.controller): adiciona handler evolucao`
- [x] `feat(dashboard.routes): registra GET /dashboard/evolucao`
- [x] `test(dashboard.routes): cobre GET /dashboard/evolucao`
- [x] `docs(swagger): documenta GET /dashboard/evolucao`

### Fase 5 — Backend: por hora / por dia da semana / por modo

- [x] `feat(dashboard.repository): adiciona somarPorHoraDoDia`
- [x] `test(dashboard.repository): cobre somarPorHoraDoDia`
- [x] `feat(dashboard.repository): adiciona somarPorDiaDaSemana`
- [x] `test(dashboard.repository): cobre somarPorDiaDaSemana`
- [x] `feat(dashboard.repository): adiciona somarPorModo`
- [x] `test(dashboard.repository): cobre somarPorModo`
- [x] `feat(dashboard.service+controller+routes): expõe por-hora`
- [x] `feat(dashboard.service+controller+routes): expõe por-dia-semana`
- [x] `feat(dashboard.service+controller+routes): expõe por-modo`
- [x] `test(dashboard.routes): cobre os três endpoints novos`
- [x] `docs(swagger): documenta os três endpoints novos`

### Fase 6 — Backend: top atividades

- [x] `feat(dashboard.repository): adiciona topAtividadesDoUsuario`
- [x] `test(dashboard.repository): cobre topAtividadesDoUsuario`
- [x] `feat(dashboard.service+controller+routes): expõe top-atividades`
- [x] `test(dashboard.routes): cobre GET /dashboard/top-atividades`
- [x] `docs(swagger): documenta GET /dashboard/top-atividades`

### Fase 7 — Frontend: API client e infraestrutura

- [x] `feat(api/dashboard): adiciona heatmap()`
- [x] `feat(api/dashboard): adiciona kpis()`
- [x] `feat(api/dashboard): adiciona distribuicao()`
- [x] `feat(api/dashboard): adiciona evolucao()`
- [x] `feat(api/dashboard): adiciona porHora() porDiaSemana() porModo()`
- [x] `feat(api/dashboard): adiciona topAtividades()`

### Fase 8 — Frontend: tema dos gráficos (Recharts + Catppuccin)

- [x] `feat(components/dashboard): adiciona useTemaGrafico (lê CSS vars do tema)`
- [x] `feat(components/dashboard): adiciona paleta de cores categóricas (8 mauves/blues/etc para fatias)`

### Fase 9 — Frontend: heatmap

- [x] `feat(components/dashboard): cria HeatmapAnual com react-activity-calendar`
- [x] `feat(components/dashboard): aplica theme Catppuccin (Latte/Mocha) no HeatmapAnual`
- [x] `feat(components/dashboard): tooltips + label do total no HeatmapAnual`

### Fase 10 — Frontend: KPI cards

- [x] `feat(components/dashboard): cria CardKpi (props: titulo, valor, sufixo)`
- [x] `feat(components/dashboard): cria GradeKpis com os 4 KPIs`
- [x] `feat(components/dashboard): formata duração humanizada (h/min) no CardKpi`

### Fase 11 — Frontend: distribuição (donut)

- [x] `feat(components/dashboard): cria DonutDistribuicao (Recharts PieChart)`
- [x] `feat(components/dashboard): adiciona legenda lateral com totais`
- [x] `feat(components/dashboard): tooltip customizado com h/min`
- [x] `feat(components/dashboard): drill-down on click (recebe rotaParaItem como prop)`

### Fase 12 — Frontend: gráficos secundários

- [x] `feat(components/dashboard): cria EvolucaoArea (Area chart 30 dias)`
- [x] `feat(components/dashboard): cria PorHoraBar (24 barras)`
- [x] `feat(components/dashboard): cria PorDiaSemanaBar (7 barras)`
- [x] `feat(components/dashboard): cria PorModoDonut (donut pequeno)`
- [x] `feat(components/dashboard): cria TopAtividadesBar (horizontal)`

### Fase 13 — Frontend: layout do Dashboard geral

- [x] `refactor(pages/Dashboard): substitui placeholder por layout em grid (KPI + heatmap + donut)`
- [x] `feat(pages/Dashboard): conecta com API (loading/erro)`
- [x] `feat(pages/Dashboard): adiciona sessão "Evolução + Top atividades"`
- [x] `feat(pages/Dashboard): adiciona sessão "Por hora / Por dia / Por modo"`

### Fase 14 — Frontend: dashboard por pasta

- [x] `feat(pages/DashboardPasta): cria página vazia com lookup do nome da pasta`
- [x] `feat(App): registra rota /pastas/:pastaId/dashboard`
- [x] `feat(pages/DashboardPasta): reusa componentes do geral filtrando por pastaId`
- [x] `feat(pages/Atividades): adiciona link "Ver dashboard" no header da pasta` (scope ajustado: `SecaoPasta` é função inline em `pages/Atividades.jsx`, não componente extraído)

### Fase 15 — Frontend: dashboard por atividade

- [x] `feat(pages/DashboardAtividade): cria página com header (nome da atividade + pasta)`
- [x] `feat(App): registra rota /atividades/:atividadeId/dashboard`
- [x] `feat(pages/DashboardAtividade): reusa componentes filtrando por atividadeId`
- [x] `feat(components/atividades/CardAtividade): adiciona link "Ver dashboard" da atividade` (escolhido CardAtividade — entrada via menu kebab dá visibilidade direta da grade)

### Fase 16 — Frontend: drill-down

- [~] `feat(pages/Dashboard): clique no donut leva para /pastas/:id/dashboard` — absorvido pela Fase 13 (`feat(pages/Dashboard): conecta com API`), o `rotaParaItem` já foi passado no commit do layout conectado.
- [~] `feat(pages/DashboardPasta): clique no donut leva para /atividades/:id/dashboard` — absorvido pela Fase 14 (`feat(pages/DashboardPasta): reusa componentes`), o `rotaParaItem` já foi passado no commit que reusou os componentes.
- [ ] `feat(components/dashboard): tooltip "clique para detalhar" no donut quando navegável`

### Fase 17 — Polish

- [ ] `style(dashboard): ajusta espaçamentos e responsividade mobile`
- [ ] `feat(dashboard): seletor de período (hoje/semana/mês/ano) afeta KPIs`
- [ ] `feat(dashboard): estado vazio quando não há sessões no escopo`
- [ ] `test(e2e): smoke test do dashboard geral (Playwright)`
- [ ] `test(e2e): drill-down geral → pasta → atividade`
- [ ] `docs(README): adiciona seção sobre dashboard`

### Fase 18 — Encerramento

- [ ] `chore(docs): marca dashboard-plano.md como concluído`

---

## Notas para a IA / armadilhas conhecidas

- **`react-activity-calendar` espera `data: [{ date: "YYYY-MM-DD", count }]`** — o backend deve retornar exatamente nesse formato (ou converter no frontend).
- **`level` (0–4) pode ser calculado no frontend** a partir do `count` máximo da janela — não complicar o backend com esse cálculo.
- **Tema do heatmap**: passar `theme={{ light: [...5 cores...], dark: [...5 cores...] }}` usando os tokens Catppuccin Latte/Mocha. Forçar `colorScheme="dark"` quando o app estiver em dark mode (ler do `ThemeContext`).
- **Recharts + dark mode**: as cores das fatias precisam vir de paleta JS (CSS vars não funcionam em SVG `fill` nativo do Recharts em todos os contextos). Criar `paleta-graficos.js` exportando arrays light/dark.
- **Streak**: cuidado com fuso. Use `iniciado_em::date AT TIME ZONE 'America/Sao_Paulo'` ou similar para agrupar pelo dia local do usuário. Confirmar TZ do banco.
- **Performance**: 365 dias × 1 atividade pode dar até 365 linhas — irrelevante. Mas `por-hora` e similares podem se beneficiar de índice em `(usuario_id, iniciado_em)` — verificar se já existe (`atividades` tem index em `usuarioId`, `sessoes` em `(atividadeId, iniciadoEm)`). Se ficar lento, criar migration para adicionar índice composto via `usuario_id` (na atividade) — provavelmente desnecessário no curto prazo.
- **Cache no frontend**: cada widget faz fetch isolado. Se ficar lento, considerar `Promise.all` no nível da página, mas começar simples.
- **Testes do seed**: existe um problema pré-existente em `backend/prisma/__tests__/seed.test.js` (mocks desatualizados). Ignorar nesta sequência — não é parte do dashboard.
