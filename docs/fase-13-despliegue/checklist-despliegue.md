# Checklist de Despliegue (Fase 13)

## Preparación
- [ ] Plan de Hostinger confirmado: VPS con Docker/Docker Compose y puertos 80/443.
- [ ] Dominio/subdominio con registro A apuntando a la IP del VPS.
- [ ] Acceso SSH al servidor.
- [ ] Decisión de correo confirmada: SMTP AUTH habilitado **o** app en Entra ID con `Mail.Send`.

## Configuración
- [ ] `.env` de producción creado desde `.env.prod.example`.
- [ ] Secretos fuertes y únicos (`JWT_*`, `CIFRADO_2FA_SECRET`, contraseñas de BD).
- [ ] `DOMINIO` y `APP_URL` correctos (https).
- [ ] Variables de SMTP completas.
- [ ] `.env` NO está en el repositorio.

## Despliegue
- [ ] `./infra/desplegar.sh` ejecutado sin errores.
- [ ] Migraciones aplicadas (`prisma migrate deploy`).
- [ ] `infra/seguridad-bd.sql` ejecutado; `DATABASE_URL` usa el rol `pac_app`.
- [ ] Primer administrador creado.

## Verificación
- [ ] `https://<dominio>/` carga el dashboard público.
- [ ] `https://<dominio>/api/health` responde `ok`.
- [ ] Certificado TLS válido.
- [ ] Login con 2FA funciona en producción.
- [ ] Correo de prueba enviado y recibido.
- [ ] PostgreSQL no accesible desde el exterior.
- [ ] Cabeceras de seguridad presentes (helmet).

## Post-despliegue
- [ ] Tag de release creado (`git tag vX.Y.Z`).
- [ ] Respaldos configurados (Fase 14).
- [ ] Monitoreo/health checks configurados (Fase 14).
- [ ] Procedimiento de rollback verificado y documentado.
