# Tally

**Tally** é um web app de rastreamento de hábitos com foco em tempo. Ele nasceu de um problema real: estudantes que dedicam horas ao estudo, mas não conseguem enxergar para onde esse tempo está indo. Usam pomodoros genéricos que cronometram, mas não vinculam o tempo a nenhuma matéria. Tentam planilhas, mas abandonam pela fricção.

O Tally junta três coisas que hoje vivem em apps separados: **timer + categorização por matéria + visualização analítica**. O usuário liga o timer, vincula a uma atividade e categoria (ex: Estudos → Bioquímica) e ao final tem gráficos de distribuição, evolução temporal e um heatmap estilo GitHub mostrando sua consistência ao longo do ano.

Apesar de ter nascido no contexto acadêmico, o modelo é genérico. Qualquer hábito cronometrado (exercício, leitura, prática de instrumento) ou binário (meditação, beber água) funciona na mesma estrutura.

---

## Como funciona

O app se organiza em três camadas:

- **Atividade** — o hábito em si. "Estudos", "Exercício", "Leitura". Pode ser cronometrada (usa timer) ou binária (check de fez/não fez).
- **Categoria** — subdivisão opcional dentro de uma atividade. No caso de Estudos: Bioquímica, Anatomia, Fisiologia. No caso de Exercício: Corrida, Musculação. Nem toda atividade precisa de categorias.
- **Sessão** — o registro concreto. Cada vez que o timer roda e para, uma sessão é salva com data, duração, atividade, categoria e modo (timer livre, pomodoro ou manual).

O timer roda inteiramente no front-end. O back-end recebe apenas o resultado final: "o usuário estudou Bioquímica por 47 minutos no dia 16/03, usando modo pomodoro".

---

## Stack

| Camada       | Tecnologia                                                    |
| ------------ | ------------------------------------------------------------- |
| Back-end     | Node.js, Express, TypeScript, Prisma, PostgreSQL              |
| Front-end    | React, Vite, React Router DOM, React Hook Form, Zod, Recharts |
| Infra        | Docker, Docker Compose, Nginx, VPS                            |
| Auth         | JWT (access token + refresh token simples)                    |
| Validação    | Zod (client e server)                                         |
| Testes       | Vitest (unitários e integração)                               |
| Documentação | Swagger/OpenAPI                                               |
| Gestão       | Jira (Scrum, 3 ciclos de 3 semanas)                           |

---

## Funcionalidades

- **Timer livre** — cronômetro com pausa/retomada, vinculado a atividade e categoria
- **Timer Pomodoro** — ciclos de foco/pausa configuráveis por atividade, com som na transição
- **Heatmap** — grid anual estilo GitHub, intensidade proporcional às horas, filtrável por atividade e categoria
- **Gráfico de distribuição** — quanto tempo foi pra cada matéria (pizza/barras), com período selecionável
- **Gráfico de evolução** — linha temporal de horas por semana ou mês
- **Dashboard** — total de horas, streak atual, maior streak, dia mais produtivo, top atividades
- **Hábitos binários** — check de fez/não fez para hábitos sem duração
- **Registro manual** — para quando esqueceu de ligar o timer
- **Configuração de Pomodoro** — tempos de foco, pausa curta, pausa longa e ciclos, por atividade
- **Autenticação** — JWT com refresh token, registro e login

---

## Roadmap

O projeto é entregue em **3 ciclos de ~3 semanas cada**, seguindo Scrum com backlog no Jira.

### Ciclo 1 — Fundação (semanas 1 a 3)

> **Objetivo:** API funcional com autenticação e os dois CRUDs estruturais.

Neste ciclo, o back-end nasce do zero. Começa com o setup do projeto (Node + Express + TypeScript + Prisma + PostgreSQL), seguido pelos middlewares fundamentais (erro global, validação com Zod, autenticação JWT). Em seguida, os dois CRUDs que são a base de tudo: atividades e categorias, com todas as regras de negócio (unicidade de nome, soft delete, arquivamento em cascata, proteção contra deleção com sessões vinculadas).

O ciclo fecha com testes (integração por domínio + unitários por camada para cada módulo), documentação Swagger, Dockerização do projeto, seed de dados e deploy em VPS.

**Ao final do Ciclo 1, o que existe:**

- API rodando em produção com 18 endpoints (auth + atividades + categorias)
- Autenticação completa (registro, login, refresh, logout)
- Documentação interativa em /api-docs
- Containers Docker com PostgreSQL
- Deploy em VPS com Nginx e HTTPS

**O que ainda não existe:** sessões, timer, pomodoro, gráficos, front-end.

---

### Ciclo 2 — Motor (semanas 4 a 6)

> **Objetivo:** app funcional de ponta a ponta. O usuário loga, escolhe matéria, usa o timer, e a sessão é salva.

Este é o ciclo mais denso. No back-end, entram os endpoints de sessões (com as validações cruzadas mais complexas do sistema: tipo de atividade vs modo de sessão, tolerância de data, pertencimento de categoria) e a configuração de pomodoro. No front-end, tudo começa: setup do projeto React com Vite e React Router DOM, telas de autenticação, o timer livre e o pomodoro como hooks customizados com máquina de estados, os CRUDs visuais de atividades e categorias, o histórico de sessões paginado com filtros, o registro manual e os hábitos binários.

**Ao final do Ciclo 2, o que existe:**

- App funcional de ponta a ponta (back + front integrados)
- 27 endpoints no back-end
- Timer livre e Pomodoro funcionando
- Telas de CRUD para atividades, categorias e configuração de pomodoro
- Histórico de sessões com filtros e paginação
- Hábitos binários com check visual

**O que ainda não existe:** heatmap, gráficos, dashboard, polish visual.

---

### Ciclo 3 — Inteligência (semanas 7 a 9)

> **Objetivo:** transformar dados em informação visual. Heatmap, gráficos e dashboard.

No back-end, os 4 endpoints de analytics são implementados: heatmap (agregação por dia), distribuição por categoria (com porcentagens), evolução temporal (série semanal/mensal com períodos vazios preenchidos) e resumo geral (streaks, médias, dia mais produtivo, top atividades). No front-end, esses dados viram componentes visuais: o heatmap com escala de cores e tooltips, gráficos de pizza/barras e linha com Recharts, e um dashboard com cards de resumo. A última semana é dedicada a polish: responsividade, loading states, estados vazios, formatação consistente, seed volumoso para demonstração, testes end-to-end e README final.

**Ao final do Ciclo 3, o que existe:**

- App completo e apresentável
- 29 endpoints no back-end
- Heatmap estilo GitHub com filtros e escala de cores
- Gráfico de distribuição por categoria
- Gráfico de evolução temporal (semanal/mensal)
- Dashboard com métricas e ranking
- Interface responsiva e polida
- Documentação completa
- Seed com dados realistas para demonstração

---

## Diferencial

| Tipo de app                            | O que faz                                          | O que falta                                     |
| -------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| Apps de pomodoro (Forest, Focus To-Do) | Cronometram                                        | Não categorizam por matéria, não geram análises |
| Apps de hábito (Habitica, Streaks)     | Rastreiam frequência                               | Não medem duração, não subdividem por área      |
| Apps acadêmicos (My Study Life)        | Organizam grade e provas                           | Não medem tempo de estudo real                  |
| **Tally**                              | **Timer + categorização + visualização analítica** | —                                               |

Nenhuma feature isolada é inédita. A combinação num fluxo único é.

---

## Setup local

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/tally.git
cd tally

# Back-end
cd backend
cp .env.example .env          # Configurar DATABASE_URL e JWT_SECRET
docker-compose up -d           # Sobe PostgreSQL + app
npx prisma migrate dev         # Rodar migrations
npx prisma db seed             # Popular com dados de teste

# A API estará em http://localhost:3000
# Swagger em http://localhost:3000/api-docs

# Front-end
cd ../frontend
npm install
npm run dev

# O app estará em http://localhost:5173
```

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://tally:tally_secret@localhost:5432/tally_db?schema=public"
JWT_SECRET="mWVU1EA5aVs/oM6Jp+6aBnJ1+NHBT28HS8ft0zcAHX9PAljz9s+cBNLTzUHtUQNckf2S3cSPY85yJXuCEYhIxg=="
JWT_REFRESH_SECRET="ybp25/L+GHbyRwc2S9b0h7XcQOX4Dqdujpp3aBewOwM5MTQX2TzPj3tDo4zuY+0GgA76Aj3Es/Sqef1Z5MvboQ=="
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
JWT_REFRESH_TOKEN_MAX_EXPIRES_IN="30d"

```

---

## Scripts úteis

```bash
# Back-end
npm run dev              # Desenvolvimento com hot reload
npm run build            # Build de produção
npm run start            # Rodar build
npm run test             # Rodar todos os testes
npm run test:unit        # Apenas unitários
npm run test:integration # Apenas integração
npx prisma studio        # Interface visual do banco

# Docker
docker-compose up -d          # Subir containers
docker-compose down           # Derrubar containers
docker-compose up --build -d  # Rebuild e subir
```

---

## Estrutura de pastas (back-end)

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts        # Schemas Zod
│   │   │   └── __tests__/
│   │   │       ├── auth.controller.spec.ts
│   │   │       ├── auth.service.spec.ts
│   │   │       ├── auth.repository.spec.ts
│   │   │       └── auth.integration.spec.ts
│   │   ├── atividades/
│   │   │   └── (mesma estrutura)
│   │   ├── categorias/
│   │   ├── sessoes/
│   │   ├── config-pomodoro/
│   │   └── analytics/
│   ├── middlewares/
│   │   ├── error-handler.ts
│   │   ├── auth.middleware.ts
│   │   └── validate.ts
│   ├── utils/
│   │   ├── errors.ts              # Classes de erro (NotFoundError, etc)
│   │   └── response.ts            # Helpers de resposta padronizada
│   ├── config/
│   │   └── swagger.ts
│   ├── app.ts
│   └── server.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tsconfig.json
└── package.json
```

---

## Licença

Este projeto é desenvolvido como trabalho acadêmico. Licença a definir.
