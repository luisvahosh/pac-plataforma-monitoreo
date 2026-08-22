# PAC — Plataforma de Seguimiento y Monitoreo

Plataforma web para el **monitoreo público de un único proyecto**: el Plan de Acción Climática (PAC) de Medellín. Consta de un **dashboard público** de solo lectura (sin autenticación) y un **área privada** para colaboradores y administradores autenticados con usuario, contraseña y doble factor (2FA), donde se registran avances, evidencias, cronograma, línea base y control de cambios, con notificaciones por correo, auditoría y trazabilidad completas.

Despliegue objetivo: **Docker + PostgreSQL sobre un VPS de Hostinger**.

## Estado del proyecto

El desarrollo sigue un **plan maestro de 16 fases** (ver `plan_maestro_pac.md`). No se avanza a la fase N+1 sin completar y validar la fase N.

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Descubrimiento y definición de requisitos | ✅ Aprobada |
| 1 | Arquitectura y diseño técnico | ✅ Aprobada |
| 2 | Infraestructura base y andamiaje | 🔨 En rama `fase-2-infraestructura` |
| 3–15 | Dominio, auth/2FA, avances, evidencias, notificaciones, auditoría, frontends, integración, hardening, despliegue, respaldos, documentación | ⏳ Pendientes |

## Documentación

- **Requisitos (Fase 0):** [`docs/fase-0-requisitos/`](docs/fase-0-requisitos/) — glosario, actores y casos de uso, reglas de negocio, requisitos no funcionales, preguntas abiertas.
- **Arquitectura (Fase 1):** [`docs/fase-1-arquitectura/`](docs/fase-1-arquitectura/) — ADRs, modelo de datos, API preliminar, matriz RBAC, arquitectura de contenedores, trazabilidad.
- **Plan maestro:** [`plan_maestro_pac.md`](plan_maestro_pac.md).
- **Prompts por fase:** `fase_0X_prompt_*.md` en la raíz.

## Stack (aprobado en Fase 1)

Backend **NestJS** (TypeScript) · Frontend **React + Vite** · **PostgreSQL** + **Prisma** · 2FA **TOTP** (Microsoft Authenticator) · contraseñas **Argon2id** · correo **Microsoft 365** · reverse proxy **Caddy** · orquestación **Docker Compose**.

## Arranque con Docker

Requisitos: Docker y Docker Compose.

1. Copia las variables de entorno y ajusta la contraseña de la base de datos:
   ```bash
   cp .env.example .env
   # edita .env y cambia POSTGRES_PASSWORD y DATABASE_URL en consecuencia
   ```
2. Levanta todo el stack (reverse proxy, frontend, backend, worker y PostgreSQL):
   ```bash
   docker compose up --build
   ```
3. Abre el navegador en **http://localhost/** — la página muestra el estado del backend.
   El endpoint de salud está en **http://localhost/api/health**.
4. Para apagar sin borrar los datos:
   ```bash
   docker compose down
   ```
   Los datos de PostgreSQL persisten en el volumen `pg_data`; al volver a `up`
   siguen ahí. Para borrar también los datos: `docker compose down -v`.

### Migraciones

El contenedor `backend` ejecuta `prisma migrate deploy` al arrancar, aplicando la
migración inicial (`backend/prisma/migrations/`). El modelo de dominio real se
añade desde la Fase 3.

### Producción (Hostinger)

Con el dominio configurado en `.env` (`DOMINIO=...`):
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
Caddy gestiona el certificado TLS automáticamente. Solo el reverse proxy publica
puertos (80/443); PostgreSQL no se expone al exterior.

## Calidad de código

- `npm install` en la raíz instala las herramientas (workspaces).
- `npm run lint` / `npm run format` ejecutan ESLint y Prettier.
- El hook de pre-commit (Husky + lint-staged) formatea y lintea lo modificado.

> **Nota:** este andamiaje se generó en la Fase 2 pero **no se verificó en runtime
> localmente** (por decisión del proyecto: el despliegue se hará directamente en
> Hostinger). La primera ejecución real ocurre al desplegar.

---

_Repositorio privado. Contiene documentación de planificación con datos del proyecto._
