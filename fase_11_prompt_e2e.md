# Prompt para Claude Code — Fase 11: Integración E2E y Pruebas de Sistema

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 11 de 16 — Integración End-to-End y Pruebas de Sistema
**Depende de:** Fases 1 a 10.
**Nota:** ya implementada en el repositorio (rama `fase-11-e2e`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero de QA senior. Validas el sistema completo integrado con pruebas E2E sobre el stack levantado con Docker.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (los cuatro flujos: visitante, colaborador, administrador, sistema) y docs/fase-1-arquitectura/. El correo corre en modo dev en pruebas (no envía).
</context>

<objective>
Cubrir con pruebas E2E automatizadas los cuatro flujos generales sobre el stack completo, con datos de demostración sembrados, verificando que funcionan de extremo a extremo.
</objective>

<tasks>
1. Seed de datos demo (backend/prisma/seed.ts): admin y colaborador con 2FA de secreto fijo (solo pruebas) y un proyecto de ejemplo; configurado como `prisma db seed`.
2. Suite Playwright en `e2e/` que cubra: visitante (dashboard + evidencias/gestión exigen auth), colaborador (login 2FA + registrar avance), administrador (crear usuario, alertas, auditoría), sistema (evaluación de vencimientos + RBAC 403).
3. Documentar el procedimiento: docker compose up → migrate deploy → prisma:seed → playwright test.
</tasks>

<deliverables>
- `backend/prisma/seed.ts` + script `prisma db seed`.
- `e2e/` (package.json, playwright.config.ts, tests/*, utils/sesion.ts, README).
- Mensaje final; nota: los bugs de integración se corrigen en esta fase.
</deliverables>
```
