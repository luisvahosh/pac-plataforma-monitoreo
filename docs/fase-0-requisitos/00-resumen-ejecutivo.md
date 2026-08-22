# 00 — Resumen Ejecutivo (Fase 0)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC — Plan de Acción Climática de Medellín)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** ✅ **Aprobada por el usuario (22-ago-2026)** — habilita el inicio de la Fase 1.

## Qué es esta entrega

La Fase 0 formaliza, sin ambigüedades y sin tomar decisiones técnicas, **qué** debe hacer la plataforma, para que la Fase 1 (Arquitectura) parta de una base inequívoca. La plataforma monitorea **un único proyecto**: un Dashboard Público de solo lectura para cualquier Visitante, y un área privada para Colaboradores y Administradores autenticados con usuario + contraseña + 2FA, con registro de Avances, Evidencias, Línea Base con control de cambios, Notificaciones por correo y Auditoría completa.

> **Decisiones del usuario registradas el 22-ago-2026:**
> - **Avance (PA-09):** Fase = promedio simple de sus Actividades; Proyecto = suma ponderada de las Fases por su peso (cada Fase aporta un % al Proyecto; los pesos suman 100 %).
> - **Avance de Actividad (PA-10):** puede subir y bajar; todo cambio queda en el histórico.
> - **Jerarquía (PA-11):** el Hito pertenece a una Actividad; la suma de Actividades conforma la Fase.
> - **Evidencias (PA-13):** el Dashboard Público muestra toda la información del Proyecto; solo el **contenido/enlace de las Evidencias** requiere login. Se elimina el concepto de Evidencia Pública (cambio respecto al texto original).
> - **Multiasignación (PA-14):** una Actividad puede tener varios Colaboradores; su avance se pondera por el peso de trabajo de cada uno.
> - **Seguridad/correo (PA-17, PA-22):** 2FA con **Microsoft Authenticator**; correos vía cuenta **Office 365 / Microsoft 365** conectada a la aplicación.
> - **Protección de datos (PA-19):** aplica la **Ley 1581 de 2012** de Colombia (habeas data): consentimiento, finalidad, deber de información, derechos del titular y medidas de seguridad.

Esta fase **no** define stack, arquitectura ni modelo de datos técnico: eso es Fase 1.

## Documentos de esta fase

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [Glosario](01-glosario.md) | Definición única de todos los términos del dominio. Fuente de verdad terminológica. |
| 02 | [Actores y casos de uso](02-actores-y-casos-de-uso.md) | Visitante, Colaborador, Administrador y Sistema de Notificaciones; 10 casos de uso y 4 flujos extremo a extremo. |
| 03 | [Reglas de negocio](03-reglas-de-negocio.md) | 18 reglas verificables (RN-01…RN-18); marcadas ✅ confirmadas o ⛔ por confirmar. |
| 04 | [Requisitos no funcionales](04-requisitos-no-funcionales.md) | Disponibilidad, rendimiento, retención, accesibilidad y subsección de seguridad obligatoria. |
| 05 | [Preguntas abiertas](05-preguntas-abiertas.md) | 24 preguntas cerradas/de opción múltiple, priorizadas por bloqueo. |

## Qué quedó confirmado (derivado del texto original del usuario)

- Un solo proyecto; Dashboard Público de solo lectura con objetivos, Cronograma, avance, Hitos, Indicadores, estados de Actividades, y Línea Base y su evolución. Expone toda la información del Proyecto, salvo el **contenido/enlace de las Evidencias**, que requiere login (PA-13).
- Colaboradores y Administradores autenticados con **2FA obligatorio** (RN-15); **sin autorregistro** público (RNF-SEC-05).
- **Línea Base inmutable** salvo cambio autorizado que conserva fecha original, nueva fecha, autor, fecha/hora, justificación e historial (RN-07).
- **Aislamiento estricto del contenido de Evidencias**: el contenido/enlace de cualquier Evidencia nunca es accesible sin autenticación, ni por URL directa (RN-13, RNF-SEC-03).
- **Conservación por trazabilidad**: Avances y Evidencias de Usuarios desactivados/eliminados no se borran (RN-14).
- **Notificaciones por correo** (activación, recuperación, 2FA, próxima a vencer, vencida, confirmación de Avance, cambios importantes), con anticipación configurable y sin duplicar Alertas (RN-11).
- **Auditoría inmutable** de acciones y accesos a datos sensibles (RN-17, RN-18); contraseñas **nunca en texto plano** (RN-16).

## Qué falta decidir

**Todas las preguntas bloqueantes fueron respondidas** (PA-09, PA-10, PA-11, PA-13, PA-14, PA-17, PA-19 y PA-22). No queda ninguna 🔴 abierta. Solo restan aclaraciones no bloqueantes, que pueden cerrarse en paralelo con la Fase 1 (lista completa en [05-preguntas-abiertas.md](05-preguntas-abiertas.md)):

1. **Importantes, no bloqueantes:** PA-08/PA-12 (umbrales y anticipación de vencimiento), PA-15 (campos obligatorios), PA-16 (qué es un "cambio importante"), PA-18 (política de contraseñas), PA-23 (¿Fase = componente estratégico?), PA-24 (unificar tipos de archivo de Evidencia).
2. **De dimensionamiento/despliegue** (para infraestructura): concurrencia, volumen y tamaño de Evidencias, tipos de archivo, retención, plan de Hostinger y dominio (el proveedor de correo ya es Office 365).

## Cierre

Esta Fase 0 fue **aprobada por el usuario el 22-ago-2026**, con todas las preguntas bloqueantes respondidas. Sus decisiones se incorporan como base del prompt de la **Fase 1 — Arquitectura y Diseño Técnico**. Las preguntas no bloqueantes pendientes se resolverán en paralelo durante la Fase 1 sin frenar su inicio.
