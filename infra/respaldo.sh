#!/usr/bin/env bash
# Respaldo de la base de datos y de los archivos de evidencia.
# Ejecutar desde la raíz del repositorio (donde está docker-compose.yml).
#
#   ./infra/respaldo.sh
#
# Variables (opcionales):
#   DIR_RESPALDOS   destino de los respaldos (por defecto /opt/pac/respaldos)
#   RETENCION_DIAS  días a conservar (por defecto 14)
set -euo pipefail

# Carga POSTGRES_USER / POSTGRES_DB desde .env si existe.
if [ -f .env ]; then set -a; . ./.env; set +a; fi

DIR_RESPALDOS="${DIR_RESPALDOS:-/opt/pac/respaldos}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
FECHA="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DIR_RESPALDOS"

echo "==> Respaldando base de datos (pg_dump)…"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-pac}" -d "${POSTGRES_DB:-pac}" -Fc \
  > "$DIR_RESPALDOS/db-$FECHA.dump"

echo "==> Respaldando archivos de evidencia…"
docker compose exec -T backend tar czf - -C /app/evidencias . \
  > "$DIR_RESPALDOS/evidencias-$FECHA.tar.gz"

echo "==> Aplicando retención (${RETENCION_DIAS} días)…"
find "$DIR_RESPALDOS" -name 'db-*.dump' -mtime "+$RETENCION_DIAS" -delete
find "$DIR_RESPALDOS" -name 'evidencias-*.tar.gz' -mtime "+$RETENCION_DIAS" -delete

echo "==> Respaldo completado en $DIR_RESPALDOS:"
ls -lh "$DIR_RESPALDOS/db-$FECHA.dump" "$DIR_RESPALDOS/evidencias-$FECHA.tar.gz"
