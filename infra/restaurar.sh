#!/usr/bin/env bash
# Restauración de la base de datos y de los archivos de evidencia desde respaldos.
# Ejecutar desde la raíz del repositorio.
#
#   ./infra/restaurar.sh <db-YYYYMMDD-HHMMSS.dump> <evidencias-YYYYMMDD-HHMMSS.tar.gz>
#
# ATENCIÓN: sobrescribe los datos actuales. Úsalo con cuidado (idealmente en un
# entorno aislado para el simulacro de recuperación).
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Uso: $0 <archivo.dump> <evidencias.tar.gz>"
  exit 1
fi
DUMP_DB="$1"
TAR_EVID="$2"

if [ -f .env ]; then set -a; . ./.env; set +a; fi

echo "==> Restaurando base de datos desde $DUMP_DB…"
docker compose exec -T postgres pg_restore -U "${POSTGRES_USER:-pac}" -d "${POSTGRES_DB:-pac}" \
  --clean --if-exists --no-owner < "$DUMP_DB"

echo "==> Restaurando archivos de evidencia desde $TAR_EVID…"
docker compose exec -T backend sh -c 'rm -rf /app/evidencias/* && tar xzf - -C /app/evidencias' < "$TAR_EVID"

echo "==> Restauración completada. Verifica /api/health y el dashboard."
