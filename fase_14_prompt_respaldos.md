# Prompt para Claude Code — Fase 14: Respaldos, Recuperación y Monitoreo

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 14 de 16 — Respaldos, Recuperación y Monitoreo
**Depende de:** Fase 13 (sistema en producción).
**Nota:** ya implementada en el repositorio (rama `fase-14-respaldos`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero de operaciones (SRE) senior. Implementas respaldos, recuperación y monitoreo básico para producción.
</role>

<context>
Fuentes de verdad: plan maestro. Se respaldan la base de datos PostgreSQL y los archivos de evidencia (volumen). El simulacro de restauración es obligatorio.
</context>

<objective>
Dejar respaldos automáticos con retención, un procedimiento de recuperación probado, y monitoreo básico (health check + disco) con alertas.
</objective>

<tasks>
1. `infra/respaldo.sh`: pg_dump (-Fc) + tar de evidencias, con retención configurable; programable por cron.
2. `infra/restaurar.sh`: restauración de BD (pg_restore --clean) y evidencias.
3. `infra/monitoreo.sh`: health check (/api/health) + uso de disco, con alertas por cron/correo (solo notifica ante problema).
4. Guías: respaldos y recuperación (con simulacro de restauración obligatorio) y monitoreo (cron + healthchecks de contenedores).
</tasks>

<deliverables>
- `infra/{respaldo.sh,restaurar.sh,monitoreo.sh}`.
- `docs/fase-14-respaldos/{respaldos-y-recuperacion.md,monitoreo.md}`.
- Mensaje final; nota: la documentación final de cierre es la Fase 15.
</deliverables>
```
