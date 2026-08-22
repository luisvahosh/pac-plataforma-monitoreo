# 01 — Architecture Decision Records (ADRs)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** Borrador — pendiente de aprobación del usuario

Cada ADR sigue el formato: Contexto · Opciones consideradas · Decisión · Justificación · Consecuencias. Las decisiones marcadas **⚠️ requiere aprobación** deben ser validadas por el usuario antes de la Fase 2. Las restricciones dadas en la Fase 0 (PostgreSQL, Docker, Hostinger, Microsoft Authenticator, Office 365, Ley 1581) son entradas fijas.

---

## ADR-0001 — Lenguaje y framework de backend ⚠️ requiere aprobación

- **Contexto:** El backend debe exponer una API, aplicar RBAC, autenticación con 2FA, subida/servido controlado de archivos, un scheduler de notificaciones y auditoría. Debe correr en contenedor Docker sobre un VPS de Hostinger.
- **Opciones consideradas:**
  - (a) **Node.js + NestJS (TypeScript).** Framework estructurado con módulos, *guards* para RBAC, `@nestjs/schedule` para tareas programadas, Passport para autenticación y `class-validator` para validación.
  - (b) **Python + FastAPI.** Ligero, tipado con Pydantic, excelente rendimiento; requiere ensamblar más piezas (auth, scheduler) manualmente.
  - (c) **PHP + Laravel.** Muy común en hosting compartido; ecosistema maduro (colas, mailer, scheduler).
- **Decisión:** **NestJS (Node.js/TypeScript).**
- **Justificación:** Trae de fábrica los bloques que el proyecto necesita (guards de autorización, módulo de scheduling, interceptores para auditoría, mailer), lo que reduce código propio en áreas sensibles a seguridad. Un único lenguaje (TypeScript) compartido con el frontend simplifica el equipo.
- **Consecuencias:** Se adopta el ecosistema Node. El worker de notificaciones puede reutilizar el mismo código de dominio. Requiere Node ≥ 20 en la imagen Docker.

## ADR-0002 — Lenguaje y framework de frontend ⚠️ requiere aprobación

- **Contexto:** Dos superficies: Dashboard Público (solo lectura, consulta ciudadana, debe ser rápido y accesible) y panel privado (login+2FA, formularios, tablas). RNF pide diseño responsivo y accesibilidad (nivel por confirmar, PA-07).
- **Opciones consideradas:**
  - (a) **React + Vite (SPA, TypeScript)** con una librería de componentes accesibles y una de gráficos.
  - (b) **Next.js (React con SSR/SSG).** Renderizado en servidor para el Dashboard Público (mejor SEO y primera carga).
  - (c) **Vue 3 + Vite.**
- **Decisión:** **React + Vite (SPA)** para el panel privado y el dashboard, con la **opción abierta de renderizar el Dashboard Público con SSR/SSG (Next.js)** si el SEO/tiempo de carga lo exigen (depende de PA-02, PA-07).
- **Justificación:** SPA cubre el panel privado con simplicidad; el Dashboard Público es de un solo proyecto y volumen acotado, por lo que una SPA con datos cacheados es suficiente en la primera versión. Se deja el SSR como evolución si se fija un objetivo estricto de accesibilidad/SEO.
- **Consecuencias:** Se añade un contenedor de build estático servido por el reverse proxy. Si más adelante se opta por SSR, se reemplaza por un contenedor Node de Next.js.

## ADR-0003 — Acceso a datos / ORM sobre PostgreSQL ⚠️ requiere aprobación

- **Contexto:** Modelo relacional con reglas de integridad fuertes (pesos que suman 100 %, inmutabilidad de línea base y auditoría, histórico de avances). PostgreSQL es restricción dada.
- **Opciones consideradas:**
  - (a) **Prisma.** Migraciones declarativas, tipado generado, buena DX.
  - (b) **TypeORM.** Integración nativa con NestJS, soporta migraciones y triggers.
  - (c) **Drizzle ORM.** Ligero, SQL-first, tipado.
- **Decisión:** **Prisma** como ORM y motor de migraciones, complementado con **restricciones e índices a nivel de PostgreSQL** (constraints `CHECK`, claves únicas, y donde aplique triggers/reglas para inmutabilidad).
- **Justificación:** Prisma da migraciones reproducibles (necesarias desde la Fase 2) y tipos seguros; las invariantes críticas (auditoría inmutable, sumas de pesos) se refuerzan en la base de datos, no solo en la aplicación.
- **Consecuencias:** Algunas invariantes (p. ej. inmutabilidad de auditoría) requerirán SQL adicional fuera del esquema Prisma. Se documentará en las migraciones de la Fase 3/8.

## ADR-0004 — Autenticación de sesión y segundo factor (2FA) ⚠️ requiere aprobación

- **Contexto:** Restricción dada: 2FA con **Microsoft Authenticator**. Sin autorregistro; cuentas creadas por Administrador; activación y recuperación por correo. Contraseñas nunca en texto plano (RN-16).
- **Opciones consideradas:**
  - (a) **TOTP estándar (RFC 6238)** con enrolamiento por código QR (URI `otpauth://`). Microsoft Authenticator soporta TOTP como "cuenta de terceros". No requiere Azure AD.
  - (b) **Notificaciones push de Microsoft Authenticator vía Microsoft Entra ID (Azure AD).** Requiere registrar la app en Entra ID y federar identidades; acopla el proyecto a Azure AD.
- **Decisión:** **TOTP estándar (RFC 6238)** verificado con la librería `otplib`, con enrolamiento por QR en Microsoft Authenticator. **Sesión mediante tokens** (access token de vida corta + refresh token), con el secreto TOTP **cifrado en reposo**. Contraseñas con **hashing Argon2id** (parámetros a fijar en Fase 4; alternativa bcrypt).
- **Justificación:** Microsoft Authenticator es totalmente compatible con TOTP sin depender de infraestructura Entra ID, lo que mantiene el sistema autónomo y desplegable en Hostinger. Cumple 2FA obligatorio (RN-15) sin acoplarse a Azure AD.
- **Consecuencias:** El enrolamiento muestra un QR una sola vez y códigos de respaldo. La política de contraseñas (PA-18) y los parámetros de Argon2id se fijan en Fase 4. Rate limiting de login/2FA se endurece en Fase 12.

## ADR-0005 — Almacenamiento de archivos de Evidencia ⚠️ requiere aprobación

- **Contexto:** Evidencias de tipo imagen, archivo y documento. El **contenido de toda Evidencia es privado** (RN-06, RN-13): nunca accesible sin autenticación ni por URL directa. Despliegue en un VPS de Hostinger con Docker.
- **Opciones consideradas:**
  - (a) **Volumen Docker en el host**, con archivos fuera del webroot, servidos por un **endpoint autenticado que hace *streaming*** del archivo tras verificar permisos.
  - (b) **Almacenamiento compatible con S3** (contenedor MinIO o servicio externo) con URLs prefirmadas de vida corta.
- **Decisión:** **Volumen Docker en el host + endpoint autenticado de descarga** para la primera versión; MinIO/S3-compatible queda como evolución si el volumen o la escala lo exigen (PA-04, PA-06).
- **Justificación:** En un único VPS, el volumen local es lo más simple y evita exponer archivos por ruta pública. El servido por endpoint autenticado garantiza RN-13 (ni siquiera por URL directa) de forma directa.
- **Consecuencias:** Los archivos nunca se colocan bajo una ruta servida estáticamente por el proxy. Se requieren validación de tipo MIME real, límites de tamaño (PA-05) y prevención de *path traversal* (se implementa en Fase 6). Backups del volumen se cubren en Fase 14.

## ADR-0006 — Motor de tareas programadas (scheduler de notificaciones) ⚠️ requiere aprobación

- **Contexto:** El Sistema de Notificaciones debe evaluar el cronograma periódicamente (p. ej. a diario), generar Alertas de próxima a vencer/vencida sin duplicar (RN-11), y debe ser un **proceso de servidor independiente del navegador**.
- **Opciones consideradas:**
  - (a) **Contenedor *worker* dedicado** con `@nestjs/schedule` (cron in-process) que consulta la base de datos y registra las notificaciones enviadas.
  - (b) **Cron del sistema** dentro de un contenedor que dispara un comando.
  - (c) **Cola de trabajos (BullMQ + Redis)** para reintentos y desacople.
- **Decisión:** **Contenedor *worker* dedicado con `@nestjs/schedule`**, que reutiliza el dominio del backend y escribe en la tabla `notificacion_enviada` para deduplicar. Se añade **BullMQ + Redis** solo si se requieren reintentos robustos de correo (evolución).
- **Justificación:** Cumple "independiente del navegador" con un contenedor propio; la deduplicación por tabla satisface RN-11 sin infraestructura extra. Redis se evita hasta que haya una necesidad real (reintentos/volumen).
- **Consecuencias:** El worker y la API comparten imagen/código pero corren como servicios separados en Docker Compose. La anticipación de alertas es configurable (PA-08/PA-12) y se lee de la tabla de reglas, no del código.

## ADR-0007 — Envío de correo transaccional vía Office 365 ⚠️ requiere aprobación

- **Contexto:** Restricción dada: correos (activación, recuperación, 2FA si aplica, alertas, confirmaciones, cambios importantes) enviados mediante una cuenta **Office 365 / Microsoft 365**.
- **Opciones consideradas:**
  - (a) **Microsoft Graph API `sendMail` con OAuth2 (client credentials).** Registro de app en Entra ID con permiso `Mail.Send`; robusto y alineado con la política actual de Microsoft.
  - (b) **SMTP autenticado de Microsoft 365** (`smtp.office365.com:587`, STARTTLS) con usuario/contraseña de un buzón de servicio.
- **Decisión:** **Diseñar una interfaz de envío de correo desacoplada** con **Microsoft Graph API + OAuth2 como implementación recomendada**, y **SMTP AUTH como alternativa** de arranque rápido.
- **Justificación:** Microsoft está **deshabilitando la autenticación básica (SMTP AUTH)** en muchos tenants; Graph API con OAuth2 (client credentials) es la vía sostenible. Desacoplar el proveedor detrás de una interfaz permite empezar con SMTP si el tenant aún lo permite y migrar sin tocar el dominio.
- **Consecuencias:** ⚠️ **Verificar con el usuario/administrador del tenant** si SMTP AUTH está habilitado o si se debe registrar una app en Entra ID con `Mail.Send`. Las credenciales/secretos se manejan como variables de entorno/secretos (Fase 2/13). Este punto es un riesgo a confirmar pronto (ver `00-resumen-arquitectura.md`).

## ADR-0008 — Reverse proxy, TLS y orquestación Docker en Hostinger ⚠️ requiere aprobación

- **Contexto:** Despliegue en Hostinger con Docker/Docker Compose. Se necesita HTTPS, enrutamiento a frontend y API, y volúmenes persistentes para PostgreSQL y evidencias.
- **Opciones consideradas:**
  - (a) **Caddy** como reverse proxy con **TLS automático** (Let's Encrypt).
  - (b) **Nginx + Certbot.**
  - (c) **Traefik** (descubrimiento dinámico por labels).
- **Decisión:** **Caddy** como reverse proxy con HTTPS automático; **Docker Compose** orquesta los servicios; **volúmenes nombrados** para datos de PostgreSQL y archivos de Evidencia; **red interna** privada entre contenedores (solo el proxy expone 80/443).
- **Justificación:** Caddy minimiza la configuración de certificados en un VPS, reduciendo errores operativos. Compose es la orquestación pedida por el plan maestro. Exponer solo el proxy reduce superficie de ataque.
- **Consecuencias:** Requiere puertos 80/443 disponibles en el plan de Hostinger y soporte de Docker/Docker Compose (**PA-20/PA-21 a confirmar**). Los detalles de `docker-compose.prod.yml`, dominio y TLS se implementan en Fase 2/13.

## ADR-0009 — Estilo de API y contrato

- **Contexto:** El frontend consume datos del dominio; se necesita separar endpoints públicos de autenticados.
- **Decisión:** **API REST sobre HTTP/JSON**, documentada con **OpenAPI**, con un prefijo `/api/public/**` para los endpoints anónimos del Dashboard Público y `/api/**` (autenticado) para el resto.
- **Justificación:** REST es suficiente para el dominio y facilita el cacheo de los endpoints públicos; la separación por prefijo hace explícito y auditable qué se expone sin autenticación (soporta RN-13).
- **Consecuencias:** Los contratos preliminares se detallan en `03-api-preliminar.md`. GraphQL queda descartado por sobrecarga innecesaria para un solo proyecto.

## ADR-0010 — Auditoría inmutable y trazabilidad

- **Contexto:** RN-17/RN-18 exigen registrar acciones y accesos a datos sensibles, sin poder alterar ni borrar los registros desde la aplicación.
- **Decisión:** Tabla `evento_auditoria` **append-only**, escrita mediante un **interceptor transversal** del backend; sin endpoints de modificación/borrado; refuerzo en base de datos revocando `UPDATE/DELETE` al rol de aplicación sobre esa tabla.
- **Justificación:** Combinar control en aplicación (interceptor) y en base de datos (permisos) hace la inmutabilidad verificable (RN-18) y difícil de eludir.
- **Consecuencias:** La consulta de auditoría (CU-10) es solo lectura. La política de retención (RNF-10, PA-06) se aplica mediante archivado, no borrado desde la app.
