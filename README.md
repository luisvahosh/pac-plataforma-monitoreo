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
| 3 | Modelo de datos y backend core del dominio | 🔨 En rama `fase-3-dominio` |
| 4 | Autenticación, usuarios, roles y 2FA | 🔨 En rama `fase-4-autenticacion` |
| 5–15 | Avances, evidencias, notificaciones, auditoría, frontends, integración, hardening, despliegue, respaldos, documentación | ⏳ Pendientes |

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

## Dominio (Fase 3)

Backend NestJS + Prisma con las entidades centrales: **Proyecto → Fase → Actividad → Hito**, e historial inmutable de **Línea Base**.

Endpoints principales (bajo `/api`):

| Método | Ruta | Descripción |
|---|---|---|
| POST/GET/PATCH/DELETE | `/api/proyectos` | CRUD de Proyecto |
| POST/GET/PATCH/DELETE | `/api/fases` | CRUD de Fase (`?proyectoId=` para listar) |
| GET | `/api/fases/validar-pesos/:proyectoId` | Verifica que los pesos de las Fases sumen 100 % |
| POST/GET/PATCH/DELETE | `/api/actividades` | CRUD de Actividad (`?faseId=` para listar) |
| GET | `/api/actividades/:id/estado?umbralDias=7` | Estado derivado (pendiente/en ejecución/finalizada/próxima a vencer/vencida) |
| POST/GET/PATCH/DELETE | `/api/hitos` | CRUD de Hito (`?actividadId=` para listar) |
| POST | `/api/linea-base/cambios` | Cambio autorizado de Línea Base (conserva fecha original + historial) |
| GET | `/api/linea-base/cambios?entidadTipo=&entidadId=` | Historial de cambios |
| GET | `/api/public/proyectos/:id/cronograma` | Cronograma con avance y estados (público) |
| GET | `/api/public/proyectos/:id/indicadores` | Indicadores agregados (público) |

> ✅ **Actualizado en la Fase 4:** los endpoints de escritura ya están protegidos
> por autenticación + rol (ver sección de Autenticación). Los públicos siguen en
> `/api/public/**`.

### Migraciones

Las migraciones viven en `backend/prisma/migrations/` (`0001_init`, `0002_dominio`)
y se aplican con `prisma migrate deploy` (el contenedor `backend` lo hace al arrancar).

### Pruebas

Lógica de dominio cubierta por pruebas unitarias (cálculo de avance RN-02, derivación
de estado RN-03/04, inmutabilidad de Línea Base RN-07):

```bash
cd backend
npm install
npm test
```

## Autenticación y roles (Fase 4)

Autenticación con contraseña + **2FA (TOTP, Microsoft Authenticator)**, contraseñas con **Argon2id**, secreto TOTP cifrado en reposo, tokens de sesión (access + refresh) y **RBAC** (Administrador / Colaborador). Sin autorregistro: las cuentas las crea un Administrador.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Paso 1: usuario + contraseña → reto de 2FA |
| POST | `/api/auth/2fa/verify` | Paso 2: código TOTP → access + refresh token |
| POST | `/api/auth/refresh` | Renueva el access token (rota el refresh) |
| POST | `/api/auth/logout` | Revoca el refresh token |
| POST | `/api/auth/activate` | Activa cuenta (define contraseña + enrola 2FA, devuelve URI otpauth) |
| POST | `/api/auth/password/forgot` | Solicita recuperación (respuesta neutra) |
| POST | `/api/auth/password/reset` | Restablece contraseña con token |
| POST/GET/PATCH | `/api/usuarios` | Gestión de usuarios — **solo Administrador** |
| POST | `/api/usuarios/:id/desactivar` | Desactiva (conserva datos, RN-14) |

**Flujo:** el Administrador crea un usuario → llega correo de activación → el usuario activa, define contraseña y escanea el QR en Microsoft Authenticator → inicia sesión con contraseña + código TOTP. Sin 2FA válido no hay sesión.

### Variables de entorno nuevas

Ver `.env.example`: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL`, `RETO_2FA_TTL`, `REFRESH_TOKEN_TTL_DIAS`, `CIFRADO_2FA_SECRET`, `PASSWORD_MIN_LONGITUD`, `LOGIN_MAX_INTENTOS`, `LOGIN_BLOQUEO_MINUTOS`, `CORREO_MODO`, `CORREO_REMITENTE`, `SMTP_*`, `APP_URL`.

### Correo (Office 365)

- `CORREO_MODO=dev` (por defecto): **no envía correos reales**, los registra en consola. Útil para desarrollo y pruebas.
- `CORREO_MODO=smtp`: envía por Office 365 / Microsoft 365 vía SMTP autenticado.

> ⚠️ **A confirmar con el administrador del tenant de Microsoft 365:** si **SMTP AUTH**
> está habilitado, o si hay que registrar una app en **Entra ID** con permiso
> `Mail.Send` (Microsoft Graph API). El envío real de correos depende de esto.

## Calidad de código

- `npm install` en la raíz instala las herramientas (workspaces).
- `npm run lint` / `npm run format` ejecutan ESLint y Prettier.
- El hook de pre-commit (Husky + lint-staged) formatea y lintea lo modificado.

> **Nota:** este andamiaje se generó en la Fase 2 pero **no se verificó en runtime
> localmente** (por decisión del proyecto: el despliegue se hará directamente en
> Hostinger). La primera ejecución real ocurre al desplegar.

---

_Repositorio privado. Contiene documentación de planificación con datos del proyecto._
