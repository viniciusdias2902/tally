#!/bin/sh
set -e

echo "Executando migrations..."
# prisma.config.ts está em backend/, por isso executamos a partir dali
cd /app/backend && npx prisma migrate deploy

echo "Iniciando servidor..."
cd /app && exec node backend/server.js
