# Prompt para Claude Code — Fase 13: Preparación de Despliegue en Hostinger

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 13 de 16 — Preparación de Despliegue en Hostinger
**Depende de:** Fase 12.
**Nota:** ya implementada en el repositorio (rama `fase-13-despliegue`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero DevOps senior. Preparas el entorno de producción en Hostinger con Docker.
</role>

<context>
Fuentes de verdad: docs/fase-1-arquitectura/ (ADR-0008) y el plan maestro. Destino: VPS de Hostinger con Docker/Docker Compose; TLS automático con Caddy; PostgreSQL dockerizado no expuesto.
</context>

<objective>
Dejar un despliegue reproducible: Compose de producción, variables de entorno, procedimiento de despliegue y rollback, endurecimiento de BD, y bootstrap del primer administrador.
</objective>

<tasks>
1. `.env.prod.example` con las variables de producción (dominio, secretos, SMTP Office 365, rol de app de BD).
2. `infra/desplegar.sh`: pull → build → migrate deploy → up con `docker-compose.prod.yml` (Caddy + TLS).
3. `infra/seguridad-bd.sql`: rol de aplicación de menor privilegio + revocación de UPDATE/DELETE sobre auditoría y línea base.
4. `backend/prisma/crear-admin.ts`: bootstrap del primer administrador con enlace de activación (sin autorregistro).
5. Guías: despliegue paso a paso, rollback y checklist de despliegue.
</tasks>

<deliverables>
- `.env.prod.example`, `infra/desplegar.sh`, `infra/seguridad-bd.sql`, `backend/prisma/crear-admin.ts`.
- `docs/fase-13-despliegue/{despliegue-hostinger.md,rollback.md,checklist-despliegue.md}`.
- Mensaje final; nota: respaldos y monitoreo son la Fase 14.
</deliverables>
```
