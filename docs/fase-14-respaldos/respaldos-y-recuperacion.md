# Respaldos y Recuperación (Fase 14)

Estrategia de respaldo de la base de datos y de los archivos de evidencia, y
procedimiento de recuperación ante desastres.

## Qué se respalda

- **Base de datos PostgreSQL** (`pg_dump -Fc`): todo el dominio, usuarios,
  auditoría, notificaciones.
- **Archivos de evidencia** (volumen `evidencias`): imágenes, documentos y
  archivos subidos.

## Respaldo manual

```bash
./infra/respaldo.sh
```

Genera en `DIR_RESPALDOS` (por defecto `/opt/pac/respaldos`):
- `db-<fecha>.dump`
- `evidencias-<fecha>.tar.gz`

y elimina los respaldos con más de `RETENCION_DIAS` días (por defecto 14).

## Respaldo automático (cron)

Programa un respaldo diario (p. ej. 2:30 a. m.). Edita el crontab del servidor:

```bash
crontab -e
```

```cron
30 2 * * * cd /ruta/al/repo && DIR_RESPALDOS=/opt/pac/respaldos RETENCION_DIAS=14 ./infra/respaldo.sh >> /var/log/pac-respaldo.log 2>&1
```

> Recomendado: copiar periódicamente los respaldos a un almacenamiento **externo**
> al VPS (otro servidor, almacenamiento de objetos, etc.). Un respaldo en el mismo
> disco no protege ante la pérdida del servidor.

## Recuperación

**ATENCIÓN:** la restauración sobrescribe los datos actuales. Practícala primero
en un entorno aislado (ver simulacro).

```bash
./infra/restaurar.sh /opt/pac/respaldos/db-<fecha>.dump /opt/pac/respaldos/evidencias-<fecha>.tar.gz
```

Después:
- Verifica `/api/health` (`estado: ok`).
- Verifica el dashboard público y un login con 2FA.
- Comprueba que las evidencias se descargan correctamente.

## Simulacro de restauración (obligatorio)

Un respaldo no probado no es confiable. Realiza este simulacro al menos una vez
tras el despliegue y periódicamente:

1. En un servidor/entorno **aislado**, clona el repo y levanta el stack con un
   `.env` de prueba.
2. Ejecuta `./infra/restaurar.sh` con un respaldo real reciente.
3. Verifica que el estado del sistema (datos y evidencias) se reconstruye por
   completo y que la aplicación funciona.
4. Anota el tiempo de recuperación (RTO) y cualquier incidencia.

## Notas

- La frecuencia (diaria) y la retención (14 días) son valores por defecto
  ajustables según el volumen real de datos (PA-04/PA-06).
- Estos scripts se generaron en la Fase 14 pero **no se ejecutaron en runtime**
  en este entorno; su primera ejecución real es en el servidor.
