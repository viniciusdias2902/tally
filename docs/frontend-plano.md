# Plano do Front-end — Tally

## Conceito visual

**Tally** é um app de rastreamento de tempo — a palavra "tally" vem de "marcar/contar". A identidade visual se inspira em **marcações analógicas** (tally marks ||||) combinadas com uma estética de **instrumento de precisão**: limpa, com tipografia confiante e cores que comunicam foco sem agressividade.

### Princípios de design

1. **Densidade informacional sem ruído** — Dados de tempo precisam ser escaneáveis. Usar espaçamento generoso mas aproveitar cada pixel com propósito. Nada de cards decorativos vazios.
2. **Tipografia como hierarquia** — Números grandes para timers e métricas (font mono/tabular), texto menor para labels. A tipografia carrega a interface, não ícones.
3. **Cor como dado, não como decoração** — As cores das categorias do usuário são protagonistas. A UI em si é quase monocromática, deixando as cores de categoria ocuparem o espaço semântico.
4. **Movimento mínimo e proposital** — Transições sutis nos estados do timer (idle → running → paused). Sem animações gratuitas.

### Paleta

**Light mode — "Papel milimetrado"**

| Token              | Hex       | Uso                                              |
|--------------------|-----------|--------------------------------------------------|
| `--bg-primary`     | `#FAFAF9` | Fundo principal (stone-50, tom quente sutil)      |
| `--bg-secondary`   | `#F5F5F4` | Cards, sidebars (stone-100)                      |
| `--bg-elevated`    | `#FFFFFF` | Modais, dropdowns                                |
| `--border`         | `#E7E5E4` | Bordas e divisores (stone-200)                   |
| `--text-primary`   | `#1C1917` | Texto principal (stone-900)                      |
| `--text-secondary` | `#78716C` | Labels, placeholders (stone-500)                 |
| `--text-muted`     | `#A8A29E` | Texto desabilitado (stone-400)                   |
| `--accent`         | `#D97706` | Ação primária — âmbar quente (amber-600)         |
| `--accent-hover`   | `#B45309` | Hover do accent (amber-700)                      |
| `--accent-subtle`  | `#FEF3C7` | Background de badges/tags accent (amber-100)     |
| `--danger`         | `#DC2626` | Erros, deleção (red-600)                         |
| `--success`        | `#16A34A` | Confirmação, timer ativo (green-600)             |
| `--timer-running`  | `#16A34A` | Indicador de timer rodando (green-600)           |
| `--timer-paused`   | `#D97706` | Timer pausado (amber-600)                        |
| `--timer-idle`     | `#78716C` | Timer parado (stone-500)                         |

**Dark mode — "Terminal"**

| Token              | Hex       | Uso                                              |
|--------------------|-----------|--------------------------------------------------|
| `--bg-primary`     | `#0C0A09` | Fundo principal (stone-950)                      |
| `--bg-secondary`   | `#1C1917` | Cards, sidebars (stone-900)                      |
| `--bg-elevated`    | `#292524` | Modais, dropdowns (stone-800)                    |
| `--border`         | `#44403C` | Bordas e divisores (stone-700)                   |
| `--text-primary`   | `#FAFAF9` | Texto principal (stone-50)                       |
| `--text-secondary` | `#A8A29E` | Labels, placeholders (stone-400)                 |
| `--text-muted`     | `#78716C` | Texto desabilitado (stone-500)                   |
| `--accent`         | `#F59E0B` | Ação primária — âmbar (amber-500)                |
| `--accent-hover`   | `#D97706` | Hover do accent (amber-600)                      |
| `--accent-subtle`  | `#451A03` | Background de badges/tags accent (amber-950)     |
| `--danger`         | `#EF4444` | Erros, deleção (red-500)                         |
| `--success`        | `#22C55E` | Confirmação, timer ativo (green-500)             |
| `--timer-running`  | `#22C55E` | Indicador de timer rodando (green-500)           |
| `--timer-paused`   | `#F59E0B` | Timer pausado (amber-500)                        |
| `--timer-idle`     | `#A8A29E` | Timer parado (stone-400)                         |

**Por que âmbar em vez de azul?**
Azul é o padrão de toda SaaS genérica. Âmbar comunica calor, foco e energia — mais alinhado com produtividade e estudo. O stone (em vez de gray/slate/zinc) adiciona uma temperatura levemente quente que evita a frieza de apps corporativos.

### Tipografia

- **Display/Timer**: `font-mono` — números do timer em tamanho grande, monospaced para estabilidade visual enquanto contam
- **Headings**: `font-sans` (Inter ou system-ui) — peso 600/700
- **Body**: `font-sans` — peso 400/500
- **Dados numéricos**: `tabular-nums` para alinhamento em tabelas e listas

### Componentes-chave

- **Timer circular**: Arco SVG com progresso, número central grande mono. Cor muda por estado (idle/running/paused). Sem gradientes — flat e legível.
- **Cards de atividade**: Borda esquerda com a cor da atividade. Layout horizontal compacto.
- **Heatmap**: Grid de quadrados com 5 níveis de opacidade da cor accent. Tooltip no hover com data e duração.
- **Sidebar**: Navegação vertical persistente no desktop, drawer no mobile.

---

## Arquitetura do front-end

```
frontend/
├── public/
│   └── sounds/               # Sons de transição do pomodoro
├── src/
│   ├── api/
│   │   ├── client.js          # Axios/fetch wrapper com interceptors (baseURL, auth, refresh)
│   │   ├── auth.js            # Endpoints de auth
│   │   ├── atividades.js      # Endpoints de atividades
│   │   ├── categorias.js      # Endpoints de categorias
│   │   ├── sessoes.js         # Endpoints de sessões
│   │   └── configPomodoro.js  # Endpoints de config pomodoro
│   ├── components/
│   │   ├── ui/                # Componentes genéricos (Button, Input, Modal, Card, etc.)
│   │   ├── layout/            # Shell, Sidebar, Header, ProtectedRoute
│   │   ├── timer/             # TimerDisplay, TimerControls, PomodoroTimer
│   │   ├── atividades/        # AtividadeCard, AtividadeForm, AtividadeLista
│   │   ├── categorias/        # CategoriaTag, CategoriaForm, CategoriaLista
│   │   └── sessoes/           # SessaoCard, SessaoForm, HistoricoLista
│   ├── hooks/
│   │   ├── useAuth.js         # Hook de autenticação (login, logout, register, token)
│   │   ├── useTimer.js        # Máquina de estados do timer livre
│   │   ├── usePomodoro.js     # Máquina de estados do pomodoro
│   │   └── useApi.js          # Hook wrapper para chamadas (loading, error, data)
│   ├── contexts/
│   │   ├── AuthContext.jsx    # Provider de autenticação global
│   │   └── ThemeContext.jsx   # Provider de dark/light mode
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Registro.jsx
│   │   ├── Dashboard.jsx       # Tela principal (Ciclo 3)
│   │   ├── Atividades.jsx      # Lista de atividades
│   │   ├── AtividadeDetalhe.jsx # Detalhe com categorias, config, sessões
│   │   ├── Timer.jsx            # Tela do timer (livre + pomodoro)
│   │   ├── Historico.jsx        # Lista de sessões com filtros
│   │   └── NaoEncontrada.jsx    # 404
│   ├── lib/
│   │   ├── formatters.js      # Formatação de tempo, datas
│   │   └── validators.js      # Schemas Zod compartilhados (reuso com backend)
│   ├── styles/
│   │   └── index.css          # Tailwind directives + CSS custom properties
│   ├── App.jsx
│   └── main.jsx
├── e2e/                       # Testes Playwright
│   ├── auth.spec.js
│   ├── atividades.spec.js
│   ├── timer.spec.js
│   └── fixtures/              # Helpers de setup (login, seed)
├── .env                       # VITE_API_URL=http://localhost:3000
├── .env.production            # VITE_API_URL=https://viniciusdias.tech/tally/api
├── index.html
├── vite.config.js
├── tailwind.config.js
├── playwright.config.js
└── package.json
```

### Decisões de arquitetura

**API client centralizado** — Um único `client.js` configura a `baseURL` a partir de `import.meta.env.VITE_API_URL`. Interceptors fazem:
- Injeção automática do `Authorization: Bearer <token>`
- Refresh automático quando recebe 401
- Redirect para `/login` quando refresh falha

**Separação pages vs components** — Pages são rotas inteiras, wired com dados. Components são reutilizáveis e recebem dados via props. Pages chamam hooks/api, components renderizam.

**Hooks de timer como máquina de estados** — `useTimer` e `usePomodoro` encapsulam toda a lógica temporal. O componente visual só consome `{ seconds, state, start, pause, reset }`. Isso torna testável e desacoplado da UI.

**Contexts mínimos** — Apenas `AuthContext` (global, necessário em toda app) e `ThemeContext` (preferência do usuário). Nada de context para dados de domínio — hooks e props resolvem.

---

## Rotas

| Rota                              | Page                 | Autenticada | Descrição                        |
|-----------------------------------|----------------------|-------------|----------------------------------|
| `/login`                          | Login                | Não         | Tela de login                    |
| `/registro`                       | Registro             | Não         | Tela de registro                 |
| `/`                               | Dashboard            | Sim         | Dashboard com métricas (Ciclo 3) |
| `/atividades`                     | Atividades           | Sim         | Lista de atividades              |
| `/atividades/:id`                 | AtividadeDetalhe     | Sim         | Categorias + config + sessões    |
| `/atividades/:id/timer`           | Timer                | Sim         | Timer livre e pomodoro           |
| `/atividades/:id/historico`       | Historico            | Sim         | Sessões com filtros e paginação  |
| `*`                               | NaoEncontrada        | Não         | 404                              |

---

## Ordem de implementação

A ordem segue a lógica de dependência: primeiro o que é base para tudo, depois features que dependem das anteriores.

### Fase 1 — Fundação (setup + auth + layout)

- [x] **1.1** Inicializar projeto Vite + React
- [x] **1.2** Instalar e configurar TailwindCSS v4
- [x] **1.3** Configurar variáveis de ambiente (`VITE_API_URL`)
- [x] **1.4** Criar `.env` e `.env.production`
- [x] **1.5** Criar CSS base com custom properties (paleta light/dark)
- [x] **1.6** Criar ThemeContext (dark/light toggle com persistência em localStorage)
- [x] **1.7** Criar api/client.js (fetch wrapper com baseURL, interceptors, refresh token)
- [x] **1.8** Criar api/auth.js (registrar, login, refresh, logout)
- [x] **1.9** Criar AuthContext + useAuth hook
- [x] **1.10** Criar componentes ui/ base (Button, Input, Modal, Spinner)
- [x] **1.11** Criar layout shell (Sidebar + Header + main content area)
- [x] **1.12** Criar ProtectedRoute wrapper
- [x] **1.13** Configurar React Router DOM com todas as rotas
- [x] **1.14** Criar página Login
- [x] **1.15** Criar página Registro
- [x] **1.16** Criar página NaoEncontrada (404)
- [x] **1.17** Configurar Playwright e criar primeiro teste e2e (fluxo de auth)

### Fase 2 — CRUDs visuais (atividades + categorias)

- [ ] **2.1** Criar api/atividades.js (listar, criar, buscar, atualizar, arquivar, deletar)
- [ ] **2.2** Criar página Atividades (lista com cards)
- [ ] **2.3** Criar AtividadeForm (modal de criação/edição)
- [ ] **2.4** Criar ações de arquivar/deletar atividade
- [ ] **2.5** Criar api/categorias.js (listar, criar, atualizar, reordenar, arquivar, deletar)
- [ ] **2.6** Criar página AtividadeDetalhe (categorias + config)
- [ ] **2.7** Criar CategoriaForm (criação/edição inline ou modal)
- [ ] **2.8** Criar ações de reordenar categorias (drag-and-drop ou botões)
- [ ] **2.9** Criar api/configPomodoro.js (buscar, upsert, deletar)
- [ ] **2.10** Criar seção de configuração de pomodoro dentro de AtividadeDetalhe
- [ ] **2.11** Testes e2e de atividades e categorias

### Fase 3 — Timer + sessões

- [ ] **3.1** Criar hook useTimer (máquina de estados: idle → running → paused → stopped)
- [ ] **3.2** Criar hook usePomodoro (ciclos foco/pausa com config da atividade)
- [ ] **3.3** Criar componente TimerDisplay (arco SVG + número mono central)
- [ ] **3.4** Criar componente TimerControls (start, pause, stop, reset)
- [ ] **3.5** Criar página Timer com toggle timer livre / pomodoro
- [ ] **3.6** Integrar seleção de categoria no timer
- [ ] **3.7** Criar api/sessoes.js (criar, listar, buscar, atualizar, deletar, duração)
- [ ] **3.8** Salvar sessão automaticamente ao parar o timer
- [ ] **3.9** Criar SessaoForm para registro manual
- [ ] **3.10** Criar página Historico (lista de sessões com filtros por categoria)
- [ ] **3.11** Implementar paginação por cursor no histórico
- [ ] **3.12** Implementar hábitos binários (check_binario no card da atividade)
- [ ] **3.13** Adicionar sons de transição no pomodoro
- [ ] **3.14** Testes e2e do timer e sessões

### Fase 4 — Dashboard e analytics (Ciclo 3)

- [ ] **4.1** Criar página Dashboard com cards de resumo
- [ ] **4.2** Implementar heatmap (grid SVG com tooltip)
- [ ] **4.3** Implementar gráfico de distribuição (Recharts — pizza/barras)
- [ ] **4.4** Implementar gráfico de evolução temporal (Recharts — linha)
- [ ] **4.5** Implementar streak e métricas no dashboard
- [ ] **4.6** Testes e2e do dashboard

### Fase 5 — Polish

- [ ] **5.1** Responsividade mobile (sidebar → drawer, timer adaptado)
- [ ] **5.2** Loading states e skeletons
- [ ] **5.3** Estados vazios (sem atividades, sem sessões, etc.)
- [ ] **5.4** Toasts para feedback de ações (criou, deletou, erro)
- [ ] **5.5** Acessibilidade (focus management, aria-labels, keyboard navigation)
- [ ] **5.6** Meta tags e favicon

---

## Variáveis de ambiente

```bash
# .env (desenvolvimento)
VITE_API_URL=http://localhost:3000

# .env.production (build de produção)
VITE_API_URL=https://viniciusdias.tech/tally/api
```

O Vite injeta `import.meta.env.VITE_API_URL` no bundle em build time. O `client.js` usa isso como baseURL.

---

## Testes Playwright

**Estratégia**: testes e2e que cobrem fluxos completos do usuário.

- **Fixtures**: helper que registra/loga um usuário e retorna o contexto autenticado
- **Isolamento**: cada teste limpa o estado (ou cria usuário único)
- **CI**: rodam contra o backend real (mesma estratégia dos testes de integração do backend)

```javascript
// playwright.config.js
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    { command: 'npm run dev', port: 5173, cwd: 'frontend' },
  ],
};
```

---

## O que NÃO faz parte do Ciclo 2

- Heatmap, gráficos e dashboard (Ciclo 3)
- Analytics endpoints no backend (Ciclo 3)
- PWA / service workers
- Notificações push
- Export de dados
