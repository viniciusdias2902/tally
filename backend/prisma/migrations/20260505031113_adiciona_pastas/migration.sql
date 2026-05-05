-- AlterTable
ALTER TABLE "atividades" ADD COLUMN     "pasta_id" UUID;

-- CreateTable
CREATE TABLE "pastas" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pastas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pastas_usuario_id_idx" ON "pastas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_pastas_nome_unico" ON "pastas"("usuario_id", "nome");

-- CreateIndex
CREATE INDEX "atividades_pasta_id_idx" ON "atividades"("pasta_id");

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_pasta_id_fkey" FOREIGN KEY ("pasta_id") REFERENCES "pastas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pastas" ADD CONSTRAINT "pastas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
