---
marp: true
theme: modus-vivendi
paginate: true
---

<!-- _class: lead -->

# Tally

### Gerenciador de Atividades e Tempo Pessoal

Vinícius Dias · Maria Rita · Pedro Gabryel

---

# O que é o Tally?

O Tally é uma aplicação para **gerenciamento de tempo e produtividade pessoal**.

Nesta primeira entrega, construímos a **API REST** que serve como base do projeto:

- **Autenticação** — registro, login e gerenciamento de tokens JWT
- **Atividades** — CRUD completo com suporte a arquivamento
- **Categorias** — subdivisões de cada atividade com cores e ordenação

> O usuário cria atividades (Faculdade, Exercício...), organiza em categorias (Cálculo, Álgebra...) e futuramente poderá registrar tempo dedicado a cada uma.

---

# Stack tecnológica — Aplicação

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| Runtime        | Node.js 22                   |
| Framework      | Express 5                    |
| Banco de dados | PostgreSQL 17                |
| ORM            | Prisma 7                     |
| Autenticação   | JWT (access + refresh token) |
| Validação      | Zod 4                        |
| Documentação   | Swagger / OpenAPI 3.0        |

---

# Stack tecnológica — Infraestrutura

| Camada          | Tecnologia                            |
| --------------- | ------------------------------------- |
| Testes          | Vitest (unitários + integração)       |
| Containerização | Docker (multi-stage) + Docker Compose |
| CI/CD           | GitHub Actions → deploy via SSH       |
| Deploy          | VPS com Nginx + HTTPS (Let's Encrypt) |

---

# Arquitetura do backend

O projeto segue uma arquitetura em **camadas com injeção de dependência manual**:

```
Routes → Controller → Service → Repository → Prisma (DB)
```

- **Routes** — define endpoints e aplica middlewares de validação
- **Controller** — extrai dados da request e delega ao service
- **Service** — regras de negócio, validações de domínio
- **Repository** — acesso ao banco via Prisma

<div class="info">

💡 Cada camada recebe suas dependências via **factory functions** (`criarAuthService(repositorio)`), facilitando os testes com mocks.

</div>

---

# Modelo de dados

| Tabela       | Descrição                                    |
| ------------ | -------------------------------------------- |
| `usuarios`   | Cadastro com email, nome e senha hash        |
| `atividades` | Atividades do usuário (cronometrada/binária) |
| `categorias` | Subdivisões de uma atividade com cor e ordem |

**Relacionamentos:**

- Usuário → N Atividades
- Atividade → N Categorias

Validação com **Zod** em todas as entradas: emails válidos, senhas de 8-72 caracteres, nomes de 1-100 caracteres, cores em formato hexadecimal.

---

# Endpoints — Autenticação

| Método | Rota              | Descrição               |
| ------ | ----------------- | ----------------------- |
| POST   | `/auth/registrar` | Criar conta             |
| POST   | `/auth/login`     | Login (retorna tokens)  |
| POST   | `/auth/refresh`   | Renovar access token    |
| POST   | `/auth/logout`    | Invalidar refresh token |

Sistema de **access token + refresh token** com rotação segura. Todas as rotas abaixo exigem **Bearer Token** no header `Authorization`.

---

# Endpoints — Atividades

| Método | Rota                       | Descrição           |
| ------ | -------------------------- | ------------------- |
| POST   | `/atividades`              | Criar atividade     |
| GET    | `/atividades`              | Listar atividades   |
| GET    | `/atividades/:id`          | Buscar por ID       |
| PATCH  | `/atividades/:id`          | Atualizar atividade |
| PATCH  | `/atividades/:id/arquivar` | Arquivar            |
| DELETE | `/atividades/:id`          | Deletar             |

Suporte a filtro `incluirArquivadas` na listagem. Exclusão protegida: não permite deletar atividade que já possui dados vinculados.

---

# Endpoints — Categorias

| Método | Rota                                                  | Descrição   |
| ------ | ----------------------------------------------------- | ----------- |
| POST   | `/atividades/:atividadeId/categorias`                 | Criar       |
| GET    | `/atividades/:atividadeId/categorias`                 | Listar      |
| PUT    | `/atividades/:atividadeId/categorias/:id`             | Atualizar   |
| PATCH  | `/atividades/:atividadeId/categorias/reordenar`       | Reordenar   |
| PATCH  | `/atividades/:atividadeId/categorias/:id/arquivar`    | Arquivar    |
| PATCH  | `/atividades/:atividadeId/categorias/:id/desarquivar` | Desarquivar |
| DELETE | `/atividades/:atividadeId/categorias/:id`             | Deletar     |

Cada categoria possui **cor hexadecimal** e **ordem** configuráveis.

---

# Testes

**306 testes** no total — unitários e de integração com banco real.

| Tipo       | O que testa                                               | Ferramentas                     |
| ---------- | --------------------------------------------------------- | ------------------------------- |
| Unitário   | Controllers, services, repositories, schemas, middlewares | Vitest + mocks                  |
| Integração | Fluxo completo HTTP → banco de dados                      | Vitest + Supertest + PostgreSQL |

```
npm run test:unitario     # roda testes unitários
npm run test:integracao   # roda testes de integração (requer PostgreSQL)
npm run test:cobertura    # gera relatório de cobertura
```

---

# CI/CD — GitHub Actions

O pipeline roda automaticamente a cada push na `main`:

```
Push na main
    ├── Job: Testes unitários ──────────┐
    │     npm ci → prisma generate → vitest  │
    ├── Job: Testes de integração ──────┤── (paralelo)
    │     npm ci → prisma generate → vitest  │
    │     + PostgreSQL como service     │
    └───────────────────────────────────┘
                    │ ambos passaram
                    ▼
            Job: Deploy na VPS
              SSH → git pull → docker compose build → up

```

---

# Deploy — Infraestrutura

<div style="display: flex; gap: 40px;">
<div style="flex: 1;">

**VPS (viniciusdias.tech)**

- Docker Compose em produção
- Containers: `tally-api` + `tally-postgres`
- Nginx do host faz reverse proxy
- HTTPS via Let's Encrypt (Certbot)

</div>
<div style="flex: 1;">

**Acesso público**

- API: `https://viniciusdias.tech/tally/api`
- Docs: `https://viniciusdias.tech/tally/api/api-docs`
- Health: `https://viniciusdias.tech/tally/api/health`

</div>
</div>

---

# Próximos passos

### Ciclo 2 — Sessões e Front-end

- Implementar módulo de **sessões de tempo** (timer, pomodoro, manual, check binário)
- Implementar **configuração de pomodoro** por atividade
- Construir o **front-end** da aplicação

### Ciclo 3 — Análise e Visualização

- **Dashboard** com métricas de produtividade
- **Heatmap** de atividade ao longo do tempo
- Relatórios e gráficos de tempo investido

---

<!-- _class: lead -->

# Obrigado!

### Dúvidas?
