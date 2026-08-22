# 00 — Resumen de Arquitectura (Fase 1)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC — Plan de Acción Climática de Medellín)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** ✅ **Aprobada por el usuario (22-ago-2026)** — habilita el inicio de la Fase 2.

## Qué es esta entrega

La Fase 1 define **cómo** se construirá la plataforma, partiendo de los requisitos aprobados en la Fase 0. Es **diseño, no código**: ADRs, modelo de datos, contratos de API, matriz de permisos, arquitectura de contenedores y trazabilidad. No se ha escrito código de aplicación ni infraestructura ejecutable.

## Documentos de esta fase

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [ADRs](01-adrs.md) | 10 decisiones de arquitectura con alternativas y consecuencias. |
| 02 | [Modelo de datos](02-modelo-datos.md) | Diagrama ER (Mermaid) y entidades que soportan las reglas de la Fase 0. |
| 03 | [API preliminar](03-api-preliminar.md) | Contratos por caso de uso; separación público/autenticado. |
| 04 | [Matriz RBAC](04-matriz-roles-permisos.md) | Permisos por rol, control de servidor. |
| 05 | [Arquitectura de contenedores](05-arquitectura-contenedores.md) | Diagrama de despliegue Docker en Hostinger. |
| 06 | [Trazabilidad](06-trazabilidad-requisitos.md) | Cada RN/RNF → entidad/endpoint/componente. |

## Stack propuesto (resumen de los ADRs)

| Capa | Decisión | ADR |
|---|---|---|
| Backend | Node.js + **NestJS** (TypeScript) | ADR-0001 |
| Frontend | **React + Vite** (SSR opcional para el dashboard) | ADR-0002 |
| Datos | **PostgreSQL** + **Prisma** (ORM/migraciones) | ADR-0003 |
| Auth/2FA | Sesión por tokens + **TOTP** (Microsoft Authenticator); contraseñas **Argon2id** | ADR-0004 |
| Evidencias | **Volumen Docker** + endpoint autenticado de descarga | ADR-0005 |
| Notificaciones | **Worker/scheduler** dedicado (`@nestjs/schedule`) | ADR-0006 |
| Correo | **Microsoft 365** (Graph API/OAuth2 recomendado; SMTP alterno) | ADR-0007 |
| Despliegue | **Docker Compose** + **Caddy** (TLS automático) en Hostinger | ADR-0008 |
| API | **REST/JSON** + OpenAPI; prefijo `/api/public` vs `/api` | ADR-0009 |
| Auditoría | Tabla **append-only** + interceptor + permisos de BD | ADR-0010 |

Todas las decisiones respetan las restricciones dadas en la Fase 0: PostgreSQL, Docker, Hostinger, Microsoft Authenticator, Office 365 y Ley 1581.

## Verificación de diseño

- **18/18 reglas de negocio** y **todos los RNF** trazados a diseño (ver [06](06-trazabilidad-requisitos.md)).
- **10/10 casos de uso** con contrato de API.
- Requisitos dependientes de preguntas no bloqueantes quedan **parametrizados**, no hardcodeados.

## Decisiones que más necesitan tu aprobación (antes de la Fase 2)

1. **Stack backend/frontend/ORM** (ADR-0001/0002/0003): NestJS + React + Prisma. Si tu equipo domina otro stack (p. ej. Laravel o FastAPI), es el momento de cambiarlo.
2. **2FA por TOTP con Microsoft Authenticator** (ADR-0004): usa TOTP estándar (sin depender de Azure AD/Entra ID). Confirmar que es aceptable frente a exigir push de Microsoft.
3. **Envío de correo con Microsoft 365** (ADR-0007): ⚠️ **verificar con el administrador del tenant** si SMTP AUTH está habilitado o si hay que registrar una app en Entra ID con permiso `Mail.Send`. Es el mayor riesgo operativo a confirmar.
4. **Almacenamiento de Evidencias en volumen Docker** (ADR-0005): válido para un VPS; confirmar frente a preferir S3/MinIO desde el inicio.
5. **Plan de Hostinger** (ADR-0008, PA-20/PA-21): confirmar que es un **VPS con Docker/Docker Compose** y puertos 80/443, no hosting compartido.

## Cierre

Esta Fase 1 fue **aprobada por el usuario el 22-ago-2026** (stack, modelo de datos y matriz de permisos). Sus decisiones son la base del prompt de la **Fase 2 — Infraestructura Base y Andamiaje del Proyecto**. Las preguntas no bloqueantes de la Fase 0 (dimensionamiento, política de contraseñas, umbrales de vencimiento, plan/dominio de Hostinger, confirmación de correo con Microsoft 365) pueden cerrarse en paralelo.
