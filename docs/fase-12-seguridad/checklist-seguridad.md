# Checklist de Seguridad (referencia de mantenimiento)

Lista de verificación para releases y mantenimiento. Marca cada ítem antes de
desplegar a producción.

## Autenticación y sesión
- [ ] 2FA obligatorio para todos los usuarios (sin excepciones).
- [ ] Contraseñas con Argon2id; nunca en texto plano en BD, logs ni correos.
- [ ] Secreto TOTP cifrado en reposo; `CIFRADO_2FA_SECRET` fuerte y único.
- [ ] `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` fuertes, distintos y secretos.
- [ ] Refresh tokens revocables; se revocan al restablecer contraseña y al desactivar usuario.
- [ ] Bloqueo por intentos fallidos activo (`LOGIN_MAX_INTENTOS`, `LOGIN_BLOQUEO_MINUTOS`).
- [ ] Rate limiting en `/api/auth/*` verificado (respuesta 429 al exceder).

## Autorización (RBAC)
- [ ] Escritura de dominio y cambio de línea base restringidos a Administrador.
- [ ] Colaborador solo opera sus actividades asignadas.
- [ ] Endpoints públicos (`/api/public/**`) no exponen datos privados.

## Datos y evidencias
- [ ] Contenido de evidencias inaccesible sin sesión (probar URL directa → 401).
- [ ] Lista blanca de extensiones y tamaño máximo aplicados.
- [ ] (Mejora) Verificación de MIME real por *magic bytes*.

## Auditoría
- [ ] Eventos generados en cada mutación.
- [ ] Sin endpoints de modificación/borrado de auditoría.
- [ ] `UPDATE`/`DELETE` revocados en BD para el rol de app sobre `evento_auditoria` y `cambio_linea_base`.

## Infraestructura / contenedores
- [ ] Contenedores como usuario no-root.
- [ ] `no-new-privileges:true` en todos los servicios.
- [ ] PostgreSQL sin puertos publicados al exterior.
- [ ] Solo el reverse proxy expone 80/443; TLS válido.
- [ ] Secretos por variables de entorno; `.env` fuera del repositorio.

## Dependencias
- [ ] `npm audit` sin vulnerabilidades altas/críticas en `backend/`, `frontend/`, `worker/`, `e2e/`.
- [ ] Imágenes base actualizadas (node:24-alpine, postgres:16-alpine, caddy:2-alpine).

## Cabeceras HTTP
- [ ] Cabeceras de `helmet` presentes; `x-powered-by` ausente.
- [ ] CORS restrictivo (solo orígenes permitidos si aplica).

## Cumplimiento
- [ ] Tratamiento de datos personales conforme a la Ley 1581 de 2012 (aviso de privacidad, derechos del titular).
