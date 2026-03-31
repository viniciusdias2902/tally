# ============================================================
# Stage 1 – instala dependências e gera o cliente Prisma
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY backend ./backend

# prisma.config.ts precisa ser executado a partir do diretório backend/
WORKDIR /app/backend
RUN npx prisma generate

# ============================================================
# Stage 2 – imagem de produção
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Usuário sem privilégios de root
RUN addgroup -S app && adduser -S app -G app

# Artefatos do build
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/backend ./backend
COPY --chown=app:app package.json ./
COPY --chown=app:app docker/prod/entrypoint.sh ./docker/prod/entrypoint.sh

RUN chmod +x ./docker/prod/entrypoint.sh

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["sh", "./docker/prod/entrypoint.sh"]
