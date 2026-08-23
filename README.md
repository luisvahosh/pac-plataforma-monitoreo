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
| 5 | Asignación de actividades y registro de avances | 🔨 En rama `fase-5-avances` |
| 6 | Gestión de evidencias | 🔨 En rama `fase-6-evidencias` |
| 7 | Notificaciones y alertas por correo | 🔨 En rama `fase-7-notificaciones` |
| 8–15 | Auditoría, frontends, integración, hardening, despliegue, respaldos, documentación | ⏳ Pendientes |

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

## Asignación y avances (Fase 5)

Los Administradores asignan Actividades a Colaboradores (con **peso de trabajo**, RN-08) y los Colaboradores registran **avances** sobre sus Actividades asignadas. El avance de la Actividad se recalcula ponderado por el peso de cada colaborador (RN-02); el histórico es **append-only** y puede subir o bajar (RN-05), siempre trazado con autor y fecha/hora.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/actividades/:id/asignaciones` | Admin | Asigna un colaborador con su peso de trabajo |
| GET | `/api/actividades/:id/asignaciones` | Autenticado | Lista asignaciones + suma de pesos + validez (100 %) |
| DELETE | `/api/actividades/:actividadId/asignaciones/:asignacionId` | Admin | Quita una asignación |
| POST | `/api/actividades/:id/avances` | Colaborador asignado / Admin | Registra un avance (recalcula el avance de la actividad) |
| GET | `/api/actividades/:id/avances` | Colaborador asignado / Admin | Histórico cronológico con autor y fecha/hora |
| GET | `/api/mis-actividades` | Colaborador | Actividades asignadas al usuario autenticado |

**Autorización (RN-10):** un Colaborador solo registra/consulta avances de sus Actividades asignadas (403 en caso contrario); el Administrador puede sobre cualquiera. Cubierto por pruebas (`avance.service.spec.ts`).

## Evidencias (Fase 6)

Evidencias asociadas a Actividades (y opcionalmente a un Avance): **enlaces**, **imágenes**, **archivos** y **documentos**, más `observacion` como metadato. El **contenido/enlace es siempre privado** (RN-06, RN-13): solo accesible autenticado, servido por un endpoint controlado; los archivos se guardan en un volumen fuera del webroot (ADR-0005), con nombre aleatorio, validación de extensión/tamaño y checksum SHA-256.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/actividades/:id/evidencias/enlace` | Registra una evidencia de tipo enlace (URL) |
| POST | `/api/actividades/:id/evidencias/archivo` | Sube archivo (`multipart/form-data`: `archivo`, `tipo`, `observacion?`) |
| GET | `/api/actividades/:id/evidencias` | Lista metadatos (nunca expone la ruta física) |
| GET | `/api/evidencias/:id/contenido` | **Descarga/stream del contenido** (autenticado) o URL del enlace |
| DELETE | `/api/evidencias/:id` | Elimina (autor o Administrador) |

**Autorización:** subir requiere estar asignado a la actividad (o ser Administrador); ver/descargar requiere sesión (RN-13). Validación de tipos y tamaño configurable (`EVIDENCIAS_MAX_MB`, `EVIDENCIAS_EXT`).

> Nota (PA-24): "archivo adjunto" y "documento de soporte" se distinguen por el campo `tipo`; pueden unificarse si el usuario lo prefiere. La verificación profunda de MIME real es un endurecimiento previsto para la Fase 12.

## Notificaciones y alertas (Fase 7)

Un **scheduler** de servidor evalúa a diario el cronograma y envía por correo **alertas de próxima a vencer / vencida**, con anticipación configurable (por defecto 7/3/1 días) y **sin duplicar** (una alerta por umbral, RN-11). Además, al registrar un avance se envía una **confirmación** al colaborador (RNF-16).

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/reglas-alerta` | Admin | Lee la configuración de anticipación de alertas |
| PUT | `/api/reglas-alerta` | Admin | Define `diasAnticipacion` (p. ej. `[7,3,1]`) y `activo` |
| GET | `/api/notificaciones/enviadas` | Admin | Log de notificaciones enviadas |
| POST | `/api/notificaciones/evaluar` | Admin | Dispara la evaluación manualmente (pruebas/operación) |

El envío usa la misma interfaz de correo desacoplada (dev/SMTP Office 365). La no-duplicación se garantiza con la tabla `notificacion_enviada`. Prueba unitaria de la lógica de umbrales en `dominio/alertas.spec.ts`.

> Nota: el scheduler corre hoy dentro del backend (`@nestjs/schedule`); puede moverse al contenedor `worker` (ADR-0006) sin cambiar la lógica. Los "cambios importantes" notificables (RN-12) quedan pendientes de definir (PA-16).

## Calidad de código

- `npm install` en la raíz instala las herramientas (workspaces).
- `npm run lint` / `npm run format` ejecutan ESLint y Prettier.
- El hook de pre-commit (Husky + lint-staged) formatea y lintea lo modificado.

> **Nota:** este andamiaje se generó en la Fase 2 pero **no se verificó en runtime
> localmente** (por decisión del proyecto: el despliegue se hará directamente en
> Hostinger). La primera ejecución real ocurre al desplegar.

---

_Repositorio privado. Contiene documentación de planificación con datos del proyecto._
