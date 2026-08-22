# PAC — Plataforma de Seguimiento y Monitoreo

Plataforma web para el **monitoreo público de un único proyecto**: el Plan de Acción Climática (PAC) de Medellín. Consta de un **dashboard público** de solo lectura (sin autenticación) y un **área privada** para colaboradores y administradores autenticados con usuario, contraseña y doble factor (2FA), donde se registran avances, evidencias, cronograma, línea base y control de cambios, con notificaciones por correo, auditoría y trazabilidad completas.

Despliegue objetivo: **Docker + PostgreSQL sobre un VPS de Hostinger**.

## Estado del proyecto

El desarrollo sigue un **plan maestro de 16 fases** (ver `plan_maestro_pac.md`). No se avanza a la fase N+1 sin completar y validar la fase N.

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Descubrimiento y definición de requisitos | ✅ Aprobada |
| 1 | Arquitectura y diseño técnico | ✅ Aprobada |
| 2 | Infraestructura base y andamiaje | ⏳ En preparación |
| 3–15 | Dominio, auth/2FA, avances, evidencias, notificaciones, auditoría, frontends, integración, hardening, despliegue, respaldos, documentación | ⏳ Pendientes |

## Documentación

- **Requisitos (Fase 0):** [`docs/fase-0-requisitos/`](docs/fase-0-requisitos/) — glosario, actores y casos de uso, reglas de negocio, requisitos no funcionales, preguntas abiertas.
- **Arquitectura (Fase 1):** [`docs/fase-1-arquitectura/`](docs/fase-1-arquitectura/) — ADRs, modelo de datos, API preliminar, matriz RBAC, arquitectura de contenedores, trazabilidad.
- **Plan maestro:** [`plan_maestro_pac.md`](plan_maestro_pac.md).
- **Prompts por fase:** `fase_0X_prompt_*.md` en la raíz.

## Stack (aprobado en Fase 1)

Backend **NestJS** (TypeScript) · Frontend **React + Vite** · **PostgreSQL** + **Prisma** · 2FA **TOTP** (Microsoft Authenticator) · contraseñas **Argon2id** · correo **Microsoft 365** · reverse proxy **Caddy** · orquestación **Docker Compose**.

## Arranque local

El andamiaje ejecutable y las instrucciones de arranque se incorporan en la **Fase 2**. Hasta entonces, este repositorio contiene la documentación de diseño.

---

_Repositorio privado. Contiene documentación de planificación con datos del proyecto._
