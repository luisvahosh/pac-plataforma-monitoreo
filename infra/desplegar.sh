#!/usr/bin/env bash
# Despliegue reproducible en el servidor (Hostinger). Ejecutar desde la raíz del
# repositorio, con un archivo .env de producción ya configurado.
#
#   ./infra/desplegar.sh
#
set -euo pipefail

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

echo "==> 1/5 Actualizando código (git pull)"
git pull --ff-only

echo "==> 2/5 Construyendo imágenes"
$COMPOSE build

echo "==> 3/5 Levantando base de datos"
$COMPOSE up -d postgres
# Espera a que PostgreSQL esté saludable
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-pac}" >/dev/null 2>&1; do
  echo "   … esperando a PostgreSQL"
  sleep 2
done

echo "==> 4/5 Aplicando migraciones"
$COMPOSE run --rm backend npx prisma migrate deploy

echo "==> 5/5 Levantando el resto del stack"
$COMPOSE up -d

echo "==> Despliegue completado. Verifica: https://\${DOMINIO}/ y /api/health"
