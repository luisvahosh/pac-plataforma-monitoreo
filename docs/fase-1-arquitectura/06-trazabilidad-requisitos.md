# 06 — Trazabilidad Requisitos → Diseño

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** Borrador — pendiente de aprobación del usuario

Cada regla de negocio (RN) y requisito no funcional (RNF) de la Fase 0 se mapea a la(s) entidad(es), endpoint(s) y/o componente(s) que lo soportan. Un requisito sin soporte sería un defecto; no hay ninguno sin cobertura.

## Reglas de negocio

| Regla | Entidad(es) | Endpoint(s) | Componente / ADR |
|---|---|---|---|
| RN-01 Jerarquía; Hito→Actividad | PROYECTO, FASE, ACTIVIDAD, HITO | `/api/public/fases`, `/actividades`, `/hitos` | Modelo datos |
| RN-02 Avance ponderado | FASE.peso, ASIGNACION.peso, AVANCE | `/api/public/fases`, `/indicadores`, `/actividades/{id}/avances` | API + cálculo backend |
| RN-03/03b Umbrales/anticipación | REGLA_ALERTA, ACTIVIDAD | `/api/reglas-alerta` | Worker (ADR-0006) |
| RN-04 Estados excluyentes | ACTIVIDAD (estado derivado) | `/api/public/actividades` | Backend (derivación) |
| RN-05 Avance sube/baja | AVANCE (append-only) | `/api/actividades/{id}/avances` | Modelo datos |
| RN-06 Evidencia privada | EVIDENCIA | `/api/evidencias/{id}/contenido` | ADR-0005 |
| RN-07 Línea Base inmutable | CAMBIO_LINEA_BASE, ACTIVIDAD, HITO | `/api/linea-base/cambios` | Modelo + ADR-0010 |
| RN-08 Multiasignación con pesos | ASIGNACION | `/api/actividades/{id}/asignaciones` | Modelo (CHECK suma=100) |
| RN-09 Campos obligatorios | ACTIVIDAD, HITO, EVIDENCIA | validación en POST correspondientes | Backend (parametrizable, PA-15) |
| RN-10 Autorización de edición | ASIGNACION, AVANCE | guards en `/avances`, `/evidencias` | RBAC (ADR-0004) |
| RN-11 No duplicar Alertas | NOTIFICACION_ENVIADA | `/api/notificaciones/enviadas` | Worker (ADR-0006) |
| RN-12 "Cambio importante" | NOTIFICACION_ENVIADA | (worker) | Parametrizable (PA-16) |
| RN-13 Aislamiento de Evidencias | EVIDENCIA | `/api/public/**` (sin evidencias), `/api/evidencias/{id}/contenido` | ADR-0005/0009 |
| RN-14 Conservación de datos | USUARIO.estado, AVANCE, EVIDENCIA | `/api/usuarios/{id}/desactivar` | Modelo datos |
| RN-15 2FA obligatorio | USUARIO.totp_secret | `/api/auth/2fa/verify` | ADR-0004 |
| RN-16 Contraseñas hash | USUARIO.password_hash | `/api/auth/**` | ADR-0004 (Argon2id) |
| RN-17 Auditoría de acciones | EVENTO_AUDITORIA | interceptor transversal | ADR-0010 |
| RN-18 Auditoría inmutable | EVENTO_AUDITORIA | `/api/auditoria` (solo lectura) | ADR-0010 (permisos BD) |

## Requisitos no funcionales

| RNF | Soporte en el diseño |
|---|---|
| RNF-01/02 Disponibilidad | Contenedores independientes + reverse proxy; objetivo a fijar (PA-01). |
| RNF-03 Tiempo de respuesta dashboard | Endpoints `/api/public/**` cacheables; SSR opcional (ADR-0002). |
| RNF-04/05 Concurrencia y volumen | Diseño parametrizable; dimensionamiento pendiente (PA-03/PA-04). |
| RNF-06/07/08 Archivos de Evidencia | Volumen dedicado + validación tipo/tamaño (ADR-0005; límites PA-05). |
| RNF-09/10 Retención | Archivado, no borrado (ADR-0010); periodos PA-06. |
| RNF-11 Conservación por trazabilidad | USUARIO.estado + FKs preservadas (RN-14). |
| RNF-12/13/14 Idioma/accesibilidad/responsive | Frontend React; nivel de accesibilidad PA-07. |
| RNF-15 Trazabilidad | EVENTO_AUDITORIA + metadatos autor/fecha en Avances/Evidencias. |
| RNF-16 Confirmaciones | Worker/API envían correo de confirmación de Avance. |
| RNF-SEC-01 2FA sin excepción | ADR-0004; guard global de 2FA. |
| RNF-SEC-02 Contraseñas no texto plano | ADR-0004 (Argon2id); TOTP cifrado. |
| RNF-SEC-03 Contenido de Evidencias privado | ADR-0005 + endpoint autenticado. |
| RNF-SEC-04 Auditoría de datos sensibles | ADR-0010 (interceptor + acceso_sensible). |
| RNF-SEC-05 Sin autorregistro | Solo `/api/usuarios` (Admin) crea cuentas. |
| RNF-SEC-06 Ley 1581 | Deber de información y derechos del titular (consulta/rectificación/actualización/supresión) modelados sobre USUARIO; medidas de seguridad transversales; detalle procedimental en fases siguientes. |

## Cobertura de casos de uso

CU-01…CU-10: todos con al menos un contrato de endpoint en `03-api-preliminar.md` (ver tabla "Cobertura de casos de uso" en ese documento). Sin huecos.

## Conclusión

- **18/18 reglas de negocio** con soporte de diseño.
- **Todos los RNF** con soporte o parametrización explícita frente a preguntas abiertas.
- **10/10 casos de uso** cubiertos por endpoints.
- Requisitos dependientes de preguntas no bloqueantes (RN-03/03b, RN-09, RN-12, dimensionamiento) quedan **parametrizados**, no hardcodeados.
