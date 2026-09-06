#!/usr/bin/env bash
# Despliegue en Hostinger DETRÁS de Nginx Proxy Manager (NPM) que corre en su
# propio contenedor sobre la red externa "red-de-sitios_red-web".
#
#   ./infra/desplegar-hostinger.sh
#
# Usa docker-compose.hostinger.yml (NO el override de Caddy). Reconstruye las
# imágenes de pac-backend Y pac-frontend con el código nuevo: el frontend se
# compila DENTRO de su imagen (npm run build → vite preview en 4173), así que
# un reinicio no basta para publicar cambios de la interfaz.
#
# Ejecutar desde la raíz del repositorio, con un .env de producción ya
# configurado (DATABASE_URL, secretos, SMTP/Graph, etc.).
set -euo pipefail

COMPOSE="docker compose -f docker-compose.hostinger.yml"

echo "==> 1/5 Actualizando código (git pull)"
git pull --ff-only

echo "==> 2/5 Construyendo imágenes (pac-backend y pac-frontend)"
$COMPOSE build

echo "==> 3/5 Levantando base de datos"
$COMPOSE up -d postgres
# Espera a que PostgreSQL esté saludable antes de migrar.
until $COMPOSE exec -T postgres pg_isready -U "${POSTGRES_USER:-pac}" >/dev/null 2>&1; do
  echo "   … esperando a PostgreSQL"
  sleep 2
done

echo "==> 4/5 Aplicando migraciones"
$COMPOSE run --rm backend npx prisma migrate deploy

echo "==> 5/5 Recreando el stack (backend + frontend)"
$COMPOSE up -d

echo "==> Despliegue completado."
echo "    Verifica el sitio a través de tu Nginx Proxy Manager (pac-frontend:4173)"
echo "    y la API en /api/health (pac-backend:3000)."
