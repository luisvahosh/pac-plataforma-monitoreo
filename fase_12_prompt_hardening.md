# Prompt para Claude Code — Fase 12: Hardening de Seguridad

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 12 de 16 — Hardening de Seguridad
**Depende de:** Fase 11.
**Nota:** ya implementada en el repositorio (rama `fase-12-hardening`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero de seguridad senior. Realizas una revisión y endurecimiento del sistema antes de producción.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (RNF de seguridad) y docs/fase-1-arquitectura/. Auditoría transversal a lo construido en fases 1–11; remediaciones, no nuevas funcionalidades.
</context>

<objective>
Remediar hallazgos de seguridad: cabeceras HTTP, rate limiting, contenedores no-root, exposición de datos, y dejar un informe por severidad y un checklist de mantenimiento.
</objective>

<tasks>
1. Cabeceras de seguridad (helmet); deshabilitar x-powered-by; trust proxy para IP real tras el reverse proxy.
2. Rate limiting global (@nestjs/throttler) y estricto en /api/auth/* (login, 2fa, recuperación).
3. Contenedores como usuario no-root (USER node) y `no-new-privileges` en todos los servicios de Docker Compose.
4. CORS restrictivo opcional (CORS_ORIGEN).
5. Informe de hardening (hallazgos por severidad, sin altos/críticos abiertos) y checklist de seguridad.
</tasks>

<deliverables>
- Cambios en `backend/src/main.ts`, `app.module.ts`, `auth/auth.controller.ts`, Dockerfiles y `docker-compose.yml`.
- `docs/fase-12-seguridad/{informe-hardening.md,checklist-seguridad.md}`.
- Mensaje final; pendientes para Fase 13: revocar UPDATE/DELETE de auditoría en BD; MIME real por magic bytes.
</deliverables>
```
