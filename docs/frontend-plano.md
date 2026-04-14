# Plano do Front-end — Tally

## Conceito visual

**Tally** é um app de rastreamento de tempo — a palavra "tally" vem de "marcar/contar". A identidade visual se inspira em **marcações analógicas** (tally marks ||||) combinadas com uma estética **moderna e acolhedora**: clean, com tipografia confiante e cores suaves que convidam ao uso sem cansar os olhos.

### Princípios de design

1. **Suavidade sem perder clareza** — Baixo contraste no chrome da UI (bordas, fundos, texto secundário), alto contraste apenas onde importa (texto principal, dados numéricos, estados do timer).
2. **Tipografia como hierarquia** — Números grandes para timers e métricas (font mono/tabular), texto menor para labels. A tipografia carrega a interface, não ícones.
3. **Cor como dado, não como decoração** — As cores das categorias do usuário são protagonistas. A UI em si é quase monocromática, deixando as cores de categoria ocuparem o espaço semântico.
4. **Movimento mínimo e proposital** — Transições sutis nos estados do timer (idle → running → paused). Sem animações gratuitas.
5. **Cantos arredondados e sombras suaves** — Bordas quase invisíveis, sombras leves nos cards e botões. Visual que parece um app nativo moderno, não um painel de controle.

### Paleta

**Light mode — "Nuvem"**

| Token              | Hex       | Uso                                              |
|--------------------|-----------|--------------------------------------------------|
| `--bg-primary`     | `#F8FAFC` | Fundo principal (slate-50)                       |
| `--bg-secondary`   | `#F1F5F9` | Áreas secundárias (slate-100)                    |
| `--bg-elevated`    | `#FFFFFF` | Cards, modais, sidebar                           |
| `--border`         | `#E2E8F0` | Bordas e divisores (slate-200)                   |
| `--text-primary`   | `#334155` | Texto principal (slate-700 — médio, não preto)   |
| `--text-secondary` | `#64748B` | Labels, placeholders (slate-500)                 |
| `--text-muted`     | `#94A3B8` | Texto desabilitado (slate-400)                   |
| `--accent`         | `#6366F1` | Ação primária — indigo (indigo-500)              |
| `--accent-hover`   | `#4F46E5` | Hover do accent (indigo-600)                     |
| `--accent-subtle`  | `#EEF2FF` | Background de badges/tags accent (indigo-50)     |
| `--danger`         | `#EF4444` | Erros, deleção (red-500)                         |
| `--success`        | `#10B981` | Confirmação, timer ativo (emerald-500)           |
| `--timer-running`  | `#10B981` | Indicador de timer rodando (emerald-500)         |
| `--timer-paused`   | `#F59E0B` | Timer pausado (amber-500)                        |
| `--timer-idle`     | `#94A3B8` | Timer parado (slate-400)                         |

**Dark mode — "Meia-noite"**

| Token              | Hex                       | Uso                                    |
|--------------------|---------------------------|----------------------------------------|
| `--bg-primary`     | `#0F172A`                 | Fundo principal (slate-900)            |
| `--bg-secondary`   | `#1E293B`                 | Áreas secundárias (slate-800)          |
| `--bg-elevated`    | `#1E293B`                 | Cards, modais, sidebar (slate-800)     |
| `--border`         | `#334155`                 | Bordas e divisores (slate-700)         |
| `--text-primary`   | `#E2E8F0`                 | Texto principal (slate-200)            |
| `--text-secondary` | `#94A3B8`                 | Labels (slate-400)                     |
| `--text-muted`     | `#64748B`                 | Texto desabilitado (slate-500)         |
| `--accent`         | `#818CF8`                 | Ação primária — indigo claro (indigo-400) |
| `--accent-hover`   | `#6366F1`                 | Hover do accent (indigo-500)           |
| `--accent-subtle`  | `rgba(99, 102, 241, 0.15)` | Background semitransparente           |
| `--danger`         | `#F87171`                 | Erros, deleção (red-400)               |
| `--success`        | `#34D399`                 | Confirmação (emerald-400)              |
| `--timer-running`  | `#34D399`                 | Timer rodando (emerald-400)            |
| `--timer-paused`   | `#FBBF24`                 | Timer pausado (amber-400)              |
| `--timer-idle`     | `#64748B`                 | Timer parado (slate-500)               |

**Por que indigo em vez de âmbar?**
Indigo é uma cor familiar e acolhedora — presente em apps como Discord, Notion e Linear. Diferente do azul corporativo genérico, o indigo tem personalidade sem ser agressivo. O slate (em vez de stone) dá um tom neutro frio que combina melhor com o accent e é mais fácil aos olhos em sessões longas de uso.

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
