#!/usr/bin/env bash
# Monitoreo básico de salud: verifica el endpoint /health y el uso de disco.
# Pensado para ejecutarse por cron; sale con código != 0 y escribe en stderr si
# hay un problema (cron puede enviar ese output por correo al administrador).
#
#   ./infra/monitoreo.sh
#
# Variables (opcionales):
#   HEALTH_URL    (por defecto http://localhost/api/health)
#   DIR_DATOS     partición a vigilar (por defecto /)
#   UMBRAL_DISCO  porcentaje máximo de uso (por defecto 85)
set -uo pipefail

HEALTH_URL="${HEALTH_URL:-http://localhost/api/health}"
DIR_DATOS="${DIR_DATOS:-/}"
UMBRAL_DISCO="${UMBRAL_DISCO:-85}"
estado=0

if ! curl -fsS --max-time 10 "$HEALTH_URL" | grep -q '"estado":"ok"'; then
  echo "ALERTA: el health check falló o no reporta estado ok ($HEALTH_URL)" >&2
  estado=1
fi

USO="$(df -P "$DIR_DATOS" | awk 'NR==2 {gsub("%","",$5); print $5}')"
if [ -n "$USO" ] && [ "$USO" -ge "$UMBRAL_DISCO" ]; then
  echo "ALERTA: uso de disco en $DIR_DATOS es ${USO}% (umbral ${UMBRAL_DISCO}%)" >&2
  estado=1
fi

if [ "$estado" -eq 0 ]; then
  echo "OK: salud correcta, disco ${USO}%."
fi
exit "$estado"
