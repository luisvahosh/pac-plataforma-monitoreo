# Informe de Hardening de Seguridad (Fase 12)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 12 de 16 — Hardening de Seguridad
**Alcance:** revisión transversal de la app construida en las Fases 3–11 antes de producción.

Hallazgos clasificados por severidad, con su estado de remediación. Los ítems marcados **Pendiente (Fase 13)** dependen del entorno de producción y se cierran en el despliegue.

## Resumen

| Severidad | Total | Remediados | Pendientes |
|---|---|---|---|
| Alta | 3 | 3 | 0 |
| Media | 5 | 4 | 1 |
| Baja | 4 | 3 | 1 |

No quedan hallazgos de severidad **alta o crítica** sin remediar.

## Alta

- **H-01 — Fuerza bruta en login/2FA.** *Remediado:* rate limiting estricto en `/api/auth/login`, `/api/auth/2fa/verify` y `/api/auth/password/forgot` (`@nestjs/throttler`), sumado al bloqueo por intentos de la Fase 4.
- **H-02 — Cabeceras de seguridad HTTP ausentes.** *Remediado:* `helmet()` aplicado globalmente; `x-powered-by` deshabilitado.
- **H-03 — Contenedores corriendo como root.** *Remediado:* backend, worker y frontend corren como usuario no-root (`USER node`); volumen de evidencias con dueño `node`.

## Media

- **M-01 — Exposición de datos privados.** *Remediado:* el contenido de evidencias solo se sirve por endpoint autenticado (RN-13); el listado nunca expone la ruta física; los endpoints públicos van bajo `/api/public/**`.
- **M-02 — Validación de entrada.** *Remediado:* `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`; DTOs tipados en todos los endpoints.
- **M-03 — Escalada de privilegios en contenedores.** *Remediado:* `no-new-privileges:true` en todos los servicios de Docker Compose.
- **M-04 — IP real tras el proxy.** *Remediado:* `trust proxy` habilitado para que rate limiting y auditoría registren la IP correcta.
- **M-05 — Verificación de tipo MIME real en subidas.** *Pendiente (mejora):* hoy se valida por extensión (lista blanca) y tamaño; se recomienda añadir verificación por *magic bytes* del contenido. No bloqueante.

## Baja

- **B-01 — Inmutabilidad de auditoría a nivel de aplicación.** *Remediado:* sin endpoints de modificación/borrado sobre `evento_auditoria`.
- **B-02 — Contraseñas y secretos.** *Remediado:* Argon2id para contraseñas; secreto TOTP cifrado (AES-GCM); nunca en logs ni respuestas.
- **B-03 — CORS.** *Remediado:* CORS restrictivo (solo si se configura `CORS_ORIGEN`); por defecto el frontend es del mismo origen vía Caddy.
- **B-04 — Inmutabilidad de auditoría a nivel de base de datos.** *Pendiente (Fase 13):* revocar `UPDATE`/`DELETE` sobre `evento_auditoria` y `cambio_linea_base` al rol de aplicación de PostgreSQL.

## Pruebas de seguridad recomendadas (en staging)

- Login/2FA: verificar bloqueo por intentos y respuesta `429` al superar el rate limit.
- Control de acceso: colaborador no accede a endpoints de administrador (`403`); anónimo no accede a endpoints protegidos (`401`).
- Subida de archivos: rechazo de extensiones no permitidas y de tamaño excesivo; imposibilidad de descargar evidencias sin sesión.
- Escaneo de dependencias: `npm audit` en `backend/`, `frontend/`, `worker/` y `e2e/` (ver checklist).
- Cabeceras: verificar presencia de las cabeceras de `helmet` en las respuestas.

## Notas

Este informe se elaboró junto con las remediaciones en código; **no se ejecutó un
pentest en runtime** en este entorno. Las pruebas de la sección anterior deben
correrse en el ambiente de staging de la Fase 11/13.
