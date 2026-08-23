# Correo vía Microsoft Graph API (recomendado)

Sustituye el envío por SMTP autenticado, que falla cuando el tenant tiene
activados los **Security Defaults** (u otras políticas que bloquean
autenticación básica/heredada) — un bloqueo a **nivel de todo el tenant**, no
del buzón individual, y que Microsoft aplica cada vez más agresivamente.

Con Graph API + OAuth2 (client credentials) no se depende de SMTP AUTH en
absoluto: la app se autentica con su propia identidad (client ID + secreto),
no como si fuera un usuario con contraseña.

## 1. Registrar la aplicación en Microsoft Entra ID

Con una cuenta de **administrador** del tenant:

1. Ve a **[entra.microsoft.com](https://entra.microsoft.com)** → **Identidad** → **Aplicaciones** → **Registros de aplicaciones** → **Nuevo registro**.
2. Nombre: `PAC - Envio de correo` (o el que prefieras).
3. Tipos de cuenta admitidos: **"Cuentas solo en este directorio organizativo"** (single-tenant).
4. URI de redirección: déjalo vacío (no se necesita para este flujo).
5. **Registrar**.
6. En la página **Información general**, copia y guarda:
   - **Id. de aplicación (cliente)** → será `MS_GRAPH_CLIENT_ID`.
   - **Id. de directorio (inquilino)** → será `MS_GRAPH_TENANT_ID`.

## 2. Dar permiso para enviar correo

1. En el menú de la app → **Permisos de API** → **Agregar un permiso** → **Microsoft Graph** → **Permisos de aplicación** (no "delegados").
2. Busca **`Mail.Send`** → márcalo → **Agregar permisos**.
3. De vuelta en la lista de permisos, haz clic en **"Conceder consentimiento de administrador para [tu organización]"** y confirma. El estado debe quedar en verde ("Concedido").

> Sin este paso, el envío fallará con un error de permisos aunque el token se obtenga correctamente.

## 3. Crear el secreto de la aplicación

1. Menú de la app → **Certificados y secretos** → **Nuevo secreto de cliente**.
2. Descripción libre, vigencia recomendada 12-24 meses → **Agregar**.
3. **Copia el "Valor" inmediatamente** (solo se muestra una vez) → será `MS_GRAPH_CLIENT_SECRET`.

## 4. (Recomendado) Restringir la app a un único buzón

Por defecto, el permiso de aplicación `Mail.Send` permite enviar **como
cualquier usuario del tenant**. Si el secreto de la app se filtrara, alguien
podría enviar correo suplantando a cualquier persona de la organización. Para
limitar la app a un solo buzón (p. ej. `apoyo@learnway.co`), usa **Exchange
Online PowerShell** (requiere permisos de administrador de Exchange):

```powershell
Connect-ExchangeOnline

New-DistributionGroup -Name "PAC-Correo-Enviadores" -Type Security -Members apoyo@learnway.co

New-ApplicationAccessPolicy `
  -AppId "<MS_GRAPH_CLIENT_ID>" `
  -PolicyScopeGroupId "PAC-Correo-Enviadores@learnway.co" `
  -AccessRight RestrictAccess `
  -Description "Solo puede enviar correo como apoyo@learnway.co"
```

Este paso es opcional pero recomendado; no bloquea el funcionamiento si se omite.

## 5. Configurar la aplicación PAC

En el `.env` del servidor:

```bash
CORREO_MODO=graph
CORREO_REMITENTE=apoyo@learnway.co
MS_GRAPH_TENANT_ID=<el Id. de directorio del paso 1>
MS_GRAPH_CLIENT_ID=<el Id. de aplicación del paso 1>
MS_GRAPH_CLIENT_SECRET=<el secreto del paso 3>
MS_GRAPH_SENDER=apoyo@learnway.co
```

`MS_GRAPH_SENDER` debe ser un buzón real del tenant (el mismo que autorizaste
en el paso 4, si lo hiciste).

Luego reconstruye y reinicia el backend:

```bash
docker compose -f docker-compose.hostinger.yml up -d --build backend
```

## 6. Verificar

Crea un usuario colaborador de prueba desde el panel de administración y
revisa que el correo de activación llegue. Si falla, revisa los logs:

```bash
docker compose -f docker-compose.hostinger.yml logs --tail=30 backend | grep -i -A2 "graph\|correo de activaci"
```

Errores típicos:
- **`HTTP 401` al obtener el token** → `MS_GRAPH_CLIENT_ID`/`MS_GRAPH_CLIENT_SECRET`/`MS_GRAPH_TENANT_ID` incorrectos.
- **`HTTP 403` al enviar** → falta el consentimiento de administrador del paso 2, o (si aplicaste el paso 4) el buzón remitente no está en el grupo autorizado.
- **`HTTP 404` al enviar** → `MS_GRAPH_SENDER` no es un buzón válido del tenant.
