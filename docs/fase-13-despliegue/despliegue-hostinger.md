# Despliegue en Hostinger (Fase 13)

Procedimiento reproducible para publicar la plataforma en un **VPS de Hostinger**
con Docker. Requiere un plan **VPS con Docker/Docker Compose** (no hosting
compartido) y puertos 80/443 disponibles.

## 0. Requisitos previos

- VPS de Hostinger con acceso SSH y Docker + Docker Compose instalados.
- Dominio o subdominio apuntando (registro A) a la IP del VPS (p. ej. `pac.tu-dominio.com`).
- Cuenta de correo Office 365 / Microsoft 365 para el envío transaccional.
  - **Confirmar con el administrador del tenant** si SMTP AUTH está habilitado
    (`smtp.office365.com:587`) o si hay que usar Microsoft Graph API con OAuth2.

## 1. Obtener el código

```bash
ssh usuario@tu-vps
git clone https://github.com/luisvahosh/pac-plataforma-monitoreo.git
cd pac-plataforma-monitoreo
git checkout main   # o la rama/tag de release
```

## 2. Configurar variables de producción

```bash
cp .env.prod.example .env
nano .env   # completar dominio, secretos, SMTP, DATABASE_URL
```

Genera secretos fuertes, por ejemplo:

```bash
openssl rand -base64 48   # para JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CIFRADO_2FA_SECRET
```

## 3. Desplegar

```bash
chmod +x infra/desplegar.sh
./infra/desplegar.sh
```

El script construye las imágenes, levanta PostgreSQL, aplica migraciones y
levanta el resto del stack con el override de producción
(`docker-compose.prod.yml`: Caddy con TLS automático en 80/443).

Equivalente manual:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 4. Endurecer la base de datos (recomendado)

Crea el rol de aplicación de menor privilegio e impide alterar la auditoría:

```bash
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f - < infra/seguridad-bd.sql
```

Luego actualiza `DATABASE_URL` en `.env` para usar el rol `pac_app` y reinicia
backend y worker:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend worker
```

## 5. Crear el primer administrador

No hay autorregistro. Crea el administrador inicial con un script puntual (o
temporalmente con el seed adaptado). Opción con `psql` + hash generado por la
app no es directa; lo más simple es un script único de bootstrap ejecutado una
vez dentro del contenedor backend (pendiente de crear según preferencia) o
habilitar temporalmente el seed con datos reales. Documentar la vía elegida.

## 6. Verificación post-despliegue (smoke test)

- [ ] `https://pac.tu-dominio.com/` carga el dashboard público.
- [ ] `https://pac.tu-dominio.com/api/health` responde `estado: ok`.
- [ ] Certificado TLS válido (candado en el navegador).
- [ ] Un administrador inicia sesión con 2FA.
- [ ] Se envía y recibe un correo de prueba (activación o recuperación).
- [ ] PostgreSQL no está expuesto públicamente (solo red interna).

## Notas

- Solo Caddy publica 80/443; el resto de servicios vive en la red interna.
- Los volúmenes `pg_data` y `evidencias` persisten datos y archivos: inclúyelos
  en la estrategia de respaldo (Fase 14).
- Para actualizar a una nueva versión: `git pull` y volver a ejecutar
  `./infra/desplegar.sh` (ver también `rollback.md`).
