-- CreateEnum
CREATE TYPE "tipo_medicao" AS ENUM ('cronometrada', 'binaria');

-- CreateEnum
CREATE TYPE "modo_sessao" AS ENUM ('timer', 'pomodoro', 'manual', 'check_binario');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "refresh_token" VARCHAR(500),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo_medicao" "tipo_medicao" NOT NULL,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "atividade_id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cor" VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" UUID NOT NULL,
    "atividade_id" UUID NOT NULL,
    "categoria_id" UUID,
    "iniciado_em" TIMESTAMPTZ NOT NULL,
    "duracao_segundos" INTEGER NOT NULL DEFAULT 0,
    "modo" "modo_sessao" NOT NULL,
    "ciclos_pomodoro" INTEGER,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_pomodoro" (
    "id" UUID NOT NULL,
    "atividade_id" UUID NOT NULL,
    "minutos_foco" INTEGER NOT NULL DEFAULT 25,
    "minutos_pausa_curta" INTEGER NOT NULL DEFAULT 5,
    "minutos_pausa_longa" INTEGER NOT NULL DEFAULT 15,
    "ciclos_antes_longa" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "config_pomodoro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "atividades_usuario_id_idx" ON "atividades"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_atividades_nome_unico" ON "atividades"("usuario_id", "nome");

-- CreateIndex
CREATE INDEX "categorias_atividade_id_idx" ON "categorias"("atividade_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_categorias_nome_unico" ON "categorias"("atividade_id", "nome");

-- CreateIndex
CREATE INDEX "idx_sessoes_atividade_inicio" ON "sessoes"("atividade_id", "iniciado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_sessoes_categoria_inicio" ON "sessoes"("categoria_id", "iniciado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_sessoes_inicio" ON "sessoes"("iniciado_em" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "config_pomodoro_atividade_id_key" ON "config_pomodoro"("atividade_id");

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_pomodoro" ADD CONSTRAINT "config_pomodoro_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
