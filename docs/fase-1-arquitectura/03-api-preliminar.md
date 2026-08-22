# 03 — API Preliminar (Contratos por Caso de Uso)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** Borrador — pendiente de aprobación del usuario

API REST sobre HTTP/JSON (ADR-0009). Dos espacios de rutas:
- **`/api/public/**`** — anónimo, solo lectura, alimenta el Dashboard Público. **Nunca** devuelve contenido/enlace de Evidencias.
- **`/api/**`** — autenticado (sesión + rol). El contenido de Evidencias solo se sirve aquí.

Autenticación: *access token* de vida corta + *refresh token*; 2FA (TOTP) obligatorio en el login (RN-15). Autorización por rol (ver `04-matriz-roles-permisos.md`).

## Endpoints públicos (Dashboard Público) — CU-01

| Método | Ruta | Devuelve |
|---|---|---|
| GET | `/api/public/proyecto` | Información general y objetivos del Proyecto. |
| GET | `/api/public/fases` | Fases con su peso y % de Avance (promedio simple de sus Actividades). |
| GET | `/api/public/actividades` | Actividades con fechas de Línea Base vigente, % de Avance y **Estado derivado**. |
| GET | `/api/public/hitos` | Hitos (por Actividad) con fecha objetivo y cumplimiento. |
| GET | `/api/public/cronograma` | Vista temporal combinada (Fases/Actividades/Hitos). |
| GET | `/api/public/indicadores` | Indicadores agregados: % Proyecto (ponderado por Fase), nº vencidas, hitos cumplidos. |
| GET | `/api/public/linea-base/historial` | Evolución de la Línea Base (cambios autorizados: fecha original → nueva, fecha, justificación). |

**Regla de aislamiento (RN-13):** ninguna de estas respuestas incluye `archivo_ref`, `url` de evidencia ni metadatos que permitan descargar Evidencias. Verificable en pruebas de la Fase 9.

## Autenticación y cuenta — CU-02, CU-03

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Usuario + contraseña → reto de 2FA (si credenciales válidas). |
| POST | `/api/auth/2fa/verify` | reto | Verifica código TOTP → emite tokens. Sin esto no hay acceso (RN-15). |
| POST | `/api/auth/refresh` | refresh token | Renueva el access token. |
| POST | `/api/auth/logout` | autenticado | Invalida la sesión. |
| POST | `/api/auth/activate` | token activación | Activa cuenta y establece contraseña + enrola 2FA (QR). |
| POST | `/api/auth/password/forgot` | público | Solicita correo de recuperación (respuesta neutra). |
| POST | `/api/auth/password/reset` | token recuperación | Restablece contraseña con token válido no expirado. |

**Errores clave:** 401 (credenciales/2FA inválidos), 410 (token expirado/usado), 429 (rate limit, Fase 12).

## Gestión de Usuarios (solo Administrador) — CU-03

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/usuarios` | Admin | Crea cuenta (dispara correo de activación). |
| GET | `/api/usuarios` | Admin | Lista usuarios y estado. |
| PATCH | `/api/usuarios/{id}` | Admin | Edita datos/rol. |
| POST | `/api/usuarios/{id}/desactivar` | Admin | Desactiva (conserva datos, RN-14). |

## Asignación de Actividades (Administrador) — CU-04

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/actividades/{id}/asignaciones` | Admin | Asigna Colaborador(es) con `peso_trabajo_porcentaje`. Valida suma = 100 % (RN-08). |
| GET | `/api/actividades/{id}/asignaciones` | Admin/Colab | Lista asignaciones y pesos. |
| DELETE | `/api/asignaciones/{id}` | Admin | Quita una asignación. |

## Registro de Avance — CU-05

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/actividades/{id}/avances` | Colab asignado / Admin | Crea Avance (`porcentaje` 0–100, `observaciones`). Puede subir o bajar (RN-05). Rechaza si no está asignado (RN-10). |
| GET | `/api/actividades/{id}/avances` | Colab asignado / Admin | Histórico cronológico con autor y fecha/hora. |
| GET | `/api/mis-actividades` | Colab | Actividades asignadas al Colaborador autenticado. |

**Validaciones:** `porcentaje` fuera de rango → 422; Actividad no asignada → 403.

## Carga y descarga de Evidencias — CU-06

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/avances/{id}/evidencias` | Colab asignado / Admin | Sube Evidencia (enlace/imagen/archivo/documento/observación). Valida tipo MIME y tamaño (PA-05). |
| GET | `/api/actividades/{id}/evidencias` | autenticado | Lista metadatos de Evidencias (sin exponer ruta física). |
| GET | `/api/evidencias/{id}/contenido` | autenticado autorizado | **Streaming** del archivo/enlace tras verificar permiso. Único punto de acceso al contenido (RN-13). |

**Seguridad:** validación de MIME real, límite de tamaño, prevención de *path traversal* (Fase 6). Acceso anónimo o por URL directa → 401/403.

## Cambio autorizado de Línea Base (Administrador) — CU-07

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/linea-base/cambios` | Admin | Cambia una fecha (Actividad/Hito) conservando fecha original, nueva, autor, fecha/hora y `justificacion` (RN-07). |
| GET | `/api/linea-base/cambios` | autenticado | Historial completo de cambios. |

**Regla:** Colaborador → 403. `justificacion` obligatoria → 422 si falta.

## Configuración de Reglas de Alerta (Administrador) — CU-08

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/reglas-alerta` | Admin | Lee configuración de anticipación (global/por Actividad). |
| PUT | `/api/reglas-alerta` | Admin | Define `dias_anticipacion` (p. ej. [7,3,1]) y ámbito (PA-08/PA-12). |

## Recepción de Notificaciones — CU-09 (actor Sistema)

Sin endpoint de usuario: las Notificaciones las genera el **worker/scheduler** (ADR-0006). Para soporte/auditoría:

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/notificaciones/enviadas` | Admin | Log de Notificaciones enviadas (dedup RN-11). |

## Consulta de Auditoría (Administrador) — CU-10

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/auditoria` | Admin | Consulta filtrable por usuario, entidad, rango de fechas y tipo de acción. Solo lectura (RN-18). |

## Cobertura de casos de uso

| CU | Endpoint(s) principal(es) |
|---|---|
| CU-01 | `/api/public/**` |
| CU-02 | `/api/auth/login`, `/api/auth/2fa/verify` |
| CU-03 | `/api/usuarios/**`, `/api/auth/activate` |
| CU-04 | `/api/actividades/{id}/asignaciones` |
| CU-05 | `/api/actividades/{id}/avances`, `/api/mis-actividades` |
| CU-06 | `/api/avances/{id}/evidencias`, `/api/evidencias/{id}/contenido` |
| CU-07 | `/api/linea-base/cambios` |
| CU-08 | `/api/reglas-alerta` |
| CU-09 | worker + `/api/notificaciones/enviadas` |
| CU-10 | `/api/auditoria` |

> La especificación OpenAPI formal (esquemas de request/response, códigos de error completos) se detalla al implementar cada módulo (Fases 3–8). Este documento fija los contratos preliminares y la separación público/privado.
