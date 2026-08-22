# 04 — Matriz de Roles y Permisos (RBAC)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** Borrador — pendiente de aprobación del usuario

Roles (según `docs/fase-0-requisitos/`): **Visitante** (no autenticado), **Colaborador**, **Administrador**. El **Sistema de Notificaciones** es un actor no humano (worker) y no aparece como rol de acceso a la API.

**Principio:** el control es de **servidor** (guards/middleware), no solo de interfaz. Ocultar un botón en el frontend nunca sustituye la verificación en el backend.

## Matriz de permisos

Leyenda: ✅ permitido · ❌ denegado · 🔒 solo sobre lo propio (Actividades asignadas / cuenta propia).

| Operación | Visitante | Colaborador | Administrador |
|---|:---:|:---:|:---:|
| Consultar Dashboard Público (info, fases, actividades, cronograma, hitos, indicadores, línea base) | ✅ | ✅ | ✅ |
| Ver contenido/enlace de Evidencias | ❌ | ✅ | ✅ |
| Iniciar sesión con 2FA | — | ✅ | ✅ |
| Activar cuenta / recuperar contraseña (propia) | — | 🔒 | 🔒 |
| Crear / editar / desactivar Usuarios | ❌ | ❌ | ✅ |
| Asignar Actividades a Colaboradores (con pesos) | ❌ | ❌ | ✅ |
| Ver "mis Actividades asignadas" | ❌ | 🔒 | ✅ |
| Registrar Avance | ❌ | 🔒 | ✅ |
| Ver histórico de Avances | ❌ | 🔒 | ✅ |
| Cargar Evidencias | ❌ | 🔒 | ✅ |
| Descargar contenido de una Evidencia | ❌ | ✅ | ✅ |
| Cambiar Línea Base (con justificación) | ❌ | ❌ | ✅ |
| Ver historial de cambios de Línea Base | ❌ | ✅ | ✅ |
| Configurar Reglas de Alerta | ❌ | ❌ | ✅ |
| Consultar log de Notificaciones enviadas | ❌ | ❌ | ✅ |
| Consultar Auditoría | ❌ | ❌ | ✅ |
| Modificar / eliminar registros de Auditoría | ❌ | ❌ | ❌ (nadie, RN-18) |

## Reglas de autorización clave (verificables)

1. **Colaborador solo sobre lo asignado (RN-10):** registrar Avance o cargar Evidencia en una Actividad no asignada → **403**. Verificable: un Colaborador con token válido recibe 403 al hacer `POST /api/actividades/{ajena}/avances`.
2. **Colaborador no toca la Línea Base (RN-07):** `POST /api/linea-base/cambios` con rol Colaborador → **403**.
3. **Visitante no accede a contenido de Evidencias (RN-06, RN-13):** `GET /api/evidencias/{id}/contenido` sin autenticación → **401**; por URL directa al archivo → no existe ruta pública que lo sirva.
4. **Gestión de Usuarios y Reglas de Alerta: solo Administrador.** Colaborador → 403.
5. **Auditoría inmutable (RN-18):** no existe endpoint de modificación/borrado; a nivel de base de datos el rol de aplicación no tiene `UPDATE`/`DELETE` sobre `evento_auditoria`.
6. **2FA obligatorio (RN-15):** ningún endpoint autenticado es accesible con una sesión que no haya superado el segundo factor.

## Consistencia con la Fase 0

Esta matriz no concede a Visitante ni a Colaborador ninguna operación prohibida por las reglas de negocio de la Fase 0:
- Visitante: solo lectura pública; sin Evidencias, sin escritura.
- Colaborador: escritura únicamente sobre sus Actividades asignadas; sin gestión de usuarios, sin Línea Base, sin Auditoría, sin Reglas de Alerta.
- Administrador: gestión completa, salvo la alteración de la Auditoría (prohibida a todos).

> El modelo de permisos definitivo (roles adicionales, si el usuario los requiere) puede refinarse; hoy solo existen los tres roles de la Fase 0. La implementación de guards y middleware corresponde a la Fase 4.
