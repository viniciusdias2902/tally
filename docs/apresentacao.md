---
marp: true
theme: modus-operandi
paginate: true
footer: "Tally — Gerenciador de Atividades e Sessões"
---

<!-- _class: lead -->

# Tally

### Gerenciador de Atividades e Sessões de Medição

Vinícius Dias · Maria Rita · Pedro Gabryel

---

# Contribuições da equipe

<div style="display: flex; align-items: flex-end; gap: 48px; justify-content: center; height: 350px; padding-bottom: 20px;">

<div style="text-align: center;">
  <div style="background: #6366F1; width: 120px; height: 243px; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
    <span style="color: white; font-weight: bold; font-size: 28px;">97</span>
  </div>
  <p style="margin: 8px 0 0; font-weight: bold;">Vinícius Dias</p>
</div>

<div style="text-align: center;">
  <div style="background: #10B981; width: 120px; height: 120px; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
    <span style="color: white; font-weight: bold; font-size: 28px;">48</span>
  </div>
  <p style="margin: 8px 0 0; font-weight: bold;">Pedro Gabryel</p>
</div>

<div style="text-align: center;">
  <div style="background: #F59E0B; width: 120px; height: 68px; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
    <span style="color: white; font-weight: bold; font-size: 28px;">27</span>
  </div>
  <p style="margin: 8px 0 0; font-weight: bold;">Maria Rita</p>
</div>

</div>

<p style="text-align: center; color: #6b7280; margin-top: 0;">Total: 172 commits</p>

---

# O que é o Tally?

Uma API REST para **gerenciamento de tempo e produtividade pessoal**.

- **Atividades** — o que você quer medir (Faculdade, Programação, Exercício...)
- **Categorias** — subdivisões de cada atividade (Cálculo, Álgebra Linear...)
- **Sessões** — registros de tempo dedicado (timer, pomodoro ou check binário)
- **Pomodoro** — configurações personalizadas por atividade

> O objetivo é permitir que o usuário acompanhe de forma granular como investe seu tempo.

---

# Stack tecnológica

| Camada         | Tecnologia                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 22                          |
| Framework      | Express 5                           |
| Banco de dados | PostgreSQL 17                       |
| ORM            | Prisma 7                            |
| Autenticação   | JWT (access + refresh token)        |
| Validação      | Zod 4                               |
| Testes         | Vitest (unitários + integração)     |
| Documentação   | Swagger / OpenAPI 3.0               |
| Containerização| Docker (multi-stage) + Docker Compose |
| CI/CD          | GitHub Actions → deploy via SSH     |

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

| Tabela           | Descrição                                |
| ---------------- | ---------------------------------------- |
| `usuarios`       | Cadastro com email, nome e senha hash    |
| `atividades`     | Atividades do usuário (cronometrada/binária) |
| `categorias`     | Subdivisões de uma atividade             |
| `sessoes`        | Registros de tempo (timer, pomodoro, manual, check) |
| `config_pomodoro`| Configuração personalizada de pomodoro   |

**Relacionamentos:**

- Usuário → N Atividades
- Atividade → N Categorias
- Atividade → N Sessões
- Atividade → 1 ConfigPomodoro (opcional)
- Categoria → N Sessões

---

# Endpoints — Autenticação

| Método | Rota              | Descrição               |
| ------ | ----------------- | ----------------------- |
| POST   | `/auth/registrar` | Criar conta             |
| POST   | `/auth/login`     | Login (retorna tokens)  |
| POST   | `/auth/refresh`   | Renovar access token    |
| POST   | `/auth/logout`    | Invalidar refresh token |

Todas as rotas abaixo exigem **Bearer Token** no header `Authorization`.

---

# Endpoints — Atividades

| Método | Rota                            | Descrição            |
| ------ | ------------------------------- | -------------------- |
| POST   | `/atividades`                   | Criar atividade      |
| GET    | `/atividades`                   | Listar atividades    |
| GET    | `/atividades/:id`               | Buscar por ID        |
| PATCH  | `/atividades/:id`               | Atualizar atividade  |
| PATCH  | `/atividades/:id/arquivar`      | Arquivar             |
| DELETE | `/atividades/:id`               | Deletar              |

---

# Endpoints — Categorias

| Método | Rota                                              | Descrição     |
| ------ | ------------------------------------------------- | ------------- |
| POST   | `/atividades/:atividadeId/categorias`              | Criar         |
| GET    | `/atividades/:atividadeId/categorias`              | Listar        |
| PUT    | `/atividades/:atividadeId/categorias/:id`          | Atualizar     |
| PATCH  | `/atividades/:atividadeId/categorias/reordenar`    | Reordenar     |
| PATCH  | `/atividades/:atividadeId/categorias/:id/arquivar` | Arquivar      |
| PATCH  | `/atividades/:atividadeId/categorias/:id/desarquivar` | Desarquivar |
| DELETE | `/atividades/:atividadeId/categorias/:id`          | Deletar       |
