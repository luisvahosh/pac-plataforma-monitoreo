# Despliegue en Hostinger con Docker Manager (detrás del nginx del host)

Guía para el escenario real: el VPS **ya tiene nginx** con varios proyectos, y
queremos un **proyecto nuevo** con la app (backend + frontend + worker) y su
**PostgreSQL** en Docker, expuesto por ese nginx.

Arquitectura: los contenedores se publican solo en `127.0.0.1` (backend `:4005`,
frontend `:4006`); el **nginx del host** hace de proxy inverso público y TLS.
No se usa Caddy (evita el choque de puertos con tu nginx).

Archivos que usa este despliegue (ya en el repo):
`docker-compose.hostinger.yml` · `.env.hostinger.example` · `infra/nginx-pac.conf`.

---

## 1. Antes de empezar (validar)

- [ ] Dominio/subdominio (p. ej. `pac.tudominio.com`) con registro **A** → IP del VPS.
- [ ] El VPS tiene Docker y Docker Manager (ya lo usas para otros proyectos).
- [ ] Puertos loopback `4005`/`4006` libres (si no, cámbialos en `.env` y en el nginx).
- [ ] (Para correo real) confirmar con el tenant de Microsoft 365 si permite **SMTP AUTH**
      en `smtp.office365.com:587`. Si no, se despliega con `CORREO_MODO=dev` y se resuelve después.

## 2. Crear el proyecto en Docker Manager

Usa la opción **desde repositorio Git** (así construye las imágenes con el código):

- Repositorio: `https://github.com/luisvahosh/pac-plataforma-monitoreo`
- Rama: `main`
- Archivo compose: **`docker-compose.hostinger.yml`**

> Si tu Docker Manager solo permite **pegar** el YAML (sin construir desde Git),
> avísame: te preparo una variante con imágenes prareconstruidas publicadas en
> GitHub Container Registry (GHCR) para que solo se descarguen, sin compilar.

## 3. Variables de entorno

Copia `.env.hostinger.example` a `.env` (o pega las variables en el panel) y
completa con secretos fuertes (`openssl rand -base64 48`). Claves imprescindibles:
`POSTGRES_*`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`CIFRADO_2FA_SECRET`, `APP_URL=https://pac.tudominio.com`, y los `SMTP_*`.

## 4. Levantar

Al desplegar, el contenedor **backend aplica las migraciones automáticamente**
al arrancar (`prisma migrate deploy`), así que no hay paso manual de migración.
Verifica en los logs que backend, worker, frontend y postgres quedan "healthy/up".

## 5. Configurar el nginx del host

```bash
sudo cp infra/nginx-pac.conf /etc/nginx/sites-available/pac.conf
# edita el dominio y, si cambiaste puertos, 4005/4006
sudo ln -s /etc/nginx/sites-available/pac.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pac.tudominio.com     # TLS (Let's Encrypt)
```

## 6. Crear el primer administrador (sin autorregistro)

En la terminal del contenedor `backend` (Docker Manager permite abrir una shell
al contenedor), ejecuta:

```bash
ADMIN_EMAIL=admin@tudominio.com ADMIN_NOMBRE="Nombre Apellido" npm run bootstrap:admin
```

Copia el **enlace de activación** que imprime y ábrelo en el navegador: define la
contraseña y escanea el QR en **Microsoft Authenticator**. Ya puedes iniciar sesión.

## 7. Endurecer la base de datos (recomendado)

En la shell del contenedor `postgres`:

```bash
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f - < infra/seguridad-bd.sql
```

(crea el rol de app de menor privilegio y bloquea UPDATE/DELETE de auditoría; luego
apunta `DATABASE_URL` a ese rol y reinicia backend/worker).

## 8. Verificación (smoke test)

- [ ] `https://pac.tudominio.com/` carga el dashboard público.
- [ ] `https://pac.tudominio.com/api/health` responde `estado: ok`.
- [ ] TLS válido (candado).
- [ ] Login de admin con 2FA.
- [ ] (Si `CORREO_MODO=smtp`) llega un correo de prueba.

## 9. Respaldos y monitoreo

Programa `infra/respaldo.sh` y `infra/monitoreo.sh` por cron (ver
`docs/fase-14-respaldos/`). Incluye los volúmenes `pg_data` y `evidencias`.

---

### Notas
- La carpeta `docker/` que se creó en otra sesión (con nombres de variables y
  puertos distintos, sin worker) **no es compatible** con esta app: usa esta guía.
- El frontend se sirve con `vite preview` tras el nginx; para muy alta carga puede
  cambiarse a un contenedor estático dedicado (mejora futura, no bloqueante).
