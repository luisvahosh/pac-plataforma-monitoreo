# Monitoreo básico (Fase 14)

Monitoreo mínimo de salud del sistema en producción: disponibilidad del servicio
y uso de disco, con alertas al administrador.

## Health check de la aplicación

El backend expone `GET /api/health`, que verifica también la conectividad con
PostgreSQL y responde `{"estado":"ok", …}`.

## Script de monitoreo

```bash
./infra/monitoreo.sh
```

- Consulta `HEALTH_URL` (por defecto `http://localhost/api/health`).
- Verifica el uso de disco de `DIR_DATOS` contra `UMBRAL_DISCO` (por defecto 85 %).
- Sale con código `0` si todo está bien; con código `!= 0` y mensaje en `stderr`
  si hay una alerta.

## Alertas por cron (correo)

Cron envía por correo cualquier salida del comando. Configura `MAILTO` y programa
el chequeo cada 5 minutos:

```bash
crontab -e
```

```cron
MAILTO=admin@tu-dominio.com
*/5 * * * * cd /ruta/al/repo && HEALTH_URL=https://pac.tu-dominio.com/api/health UMBRAL_DISCO=85 ./infra/monitoreo.sh
```

Como `monitoreo.sh` solo escribe en `stderr`/stdout cuando hay problema (o "OK"
en stdout), conviene silenciar el "OK" para no recibir correos de rutina:

```cron
*/5 * * * * cd /ruta/al/repo && ./infra/monitoreo.sh >/dev/null
```

Así solo llegan correos cuando el health check falla o el disco supera el umbral.

## Healthchecks de contenedores

`docker-compose.yml` ya define un healthcheck para PostgreSQL. Docker reinicia
los servicios con `restart: unless-stopped`. Para ver el estado:

```bash
docker compose ps
docker compose logs -f backend
```

## Evolución (opcional)

Para un monitoreo más completo (métricas, dashboards, alertas por múltiples
canales) se puede integrar más adelante una solución como Uptime Kuma o
Prometheus + Grafana. Queda fuera del alcance mínimo de esta fase.
