# Plan Maestro del Proyecto — Plataforma de Seguimiento y Monitoreo (PAC)

**Fecha:** 22 de agosto de 2026
**Estado:** Pendiente de aprobación — no se ha generado código ni prompts de implementación.

## Visión general

Este documento es el plan maestro para construir, con Claude Code, una plataforma web de monitoreo público de un único proyecto: dashboard público sin autenticación para cualquier visitante, y un área privada para colaboradores autenticados con usuario, contraseña y 2FA, donde se registran avances, evidencias, cronograma, línea base y control de cambios, con notificaciones por correo, auditoría y trazabilidad completas. Despliegue final en Hostinger con Docker y PostgreSQL.

El plan se organiza en 16 fases, en orden de ejecución obligatorio. No se avanza a la fase N+1 sin completar, probar y validar la fase N. Para cada fase, una vez aprobada en este plan, se generará por separado un prompt especializado en Markdown con etiquetas XML, listo para usar en Claude Code, identificando previamente las skills de Claude aplicables.

### Nota sobre disponibilidad de skills

Existen skills genéricas de ingeniería reutilizables en varias fases: `engineering:architecture` (ADRs y decisiones de diseño), `engineering:system-design` (diseño de APIs y modelos de datos), `engineering:testing-strategy` (estrategia de pruebas), `engineering:code-review` (revisión de código en cada validación de fase), `engineering:deploy-checklist` (checklist previo a producción), `engineering:documentation` (documentación técnica), `web-design-guidelines` (accesibilidad y buenas prácticas de UI) y `qa-playwright` (pruebas E2E automatizadas).

No existe una skill dedicada para: configuración de Docker/PostgreSQL, implementación de autenticación con 2FA, envío de correos transaccionales, ni auditoría/trazabilidad. Estas fases se ejecutarán con instrucciones detalladas de ingeniería estándar dentro del prompt de cada fase (buenas prácticas de la industria), sin una skill de Claude que las respalde directamente. Se señala esto ahora, tal como se solicitó, para que quede explícito antes de construir los prompts.

---

## Fase 0 — Descubrimiento y Definición de Requisitos

**Objetivo:** Consolidar y formalizar todos los requisitos funcionales y no funcionales del proyecto en un documento de especificación único, resolviendo ambigüedades antes de tocar arquitectura o código.

**Alcance:** Recolección de requisitos ya descritos por el usuario, definición de actores (visitante, colaborador, administrador), casos de uso, glosario del dominio (actividad, hito, línea base, evidencia, avance), y reglas de negocio explícitas (por ejemplo, cómo se calcula el % de avance del proyecto, qué hace pública o privada una evidencia, qué umbrales de vencimiento aplican por defecto).

**Funcionalidades a desarrollar:** Ninguna (fase documental).

**Dependencias:** Ninguna. Es la fase inicial.

**Entregables:**
- Documento de especificación funcional (casos de uso, actores, reglas de negocio, glosario).
- Documento de requisitos no funcionales (rendimiento, disponibilidad, seguridad, escalabilidad, retención de datos, cumplimiento).
- Lista de preguntas abiertas resueltas con el usuario (por ejemplo: número estimado de colaboradores, volumen de evidencias, tamaño máximo de archivo, dominio/subdominio de Hostinger, proveedor de correo SMTP).

**Criterios de aceptación:** El usuario aprueba el documento de especificación sin ambigüedades pendientes.

**Pruebas:** No aplica (fase documental); se valida por revisión y aprobación del usuario.

**Riesgos/consideraciones:** Requisitos incompletos aquí se propagan a todas las fases siguientes; es la fase con mayor apalancamiento.

**Requisitos técnicos:** Ninguno.

---

## Fase 1 — Arquitectura y Diseño Técnico

**Objetivo:** Definir la arquitectura completa del sistema: stack tecnológico, estructura de repositorio, modelo de datos conceptual, diseño de API, estrategia de autenticación/2FA, estrategia de almacenamiento de evidencias, y estrategia de despliegue en Docker sobre Hostinger.

**Alcance:** Diseño, no implementación. Incluye ADRs (Architecture Decision Records) para las decisiones clave: framework backend, framework frontend, ORM, proveedor de 2FA (TOTP vs. email OTP), almacenamiento de archivos (filesystem en volumen Docker vs. objeto compatible S3), motor de colas/tareas programadas para alertas.

**Funcionalidades a desarrollar:** Diagramas de arquitectura, diagrama entidad-relación preliminar, especificación OpenAPI preliminar de los endpoints principales, definición de roles y matriz de permisos (RBAC).

**Dependencias:** Fase 0 aprobada.

**Entregables:**
- ADRs de las decisiones tecnológicas principales.
- Diagrama de arquitectura de contenedores (frontend, backend, PostgreSQL, worker de notificaciones, proxy/reverse proxy).
- Modelo entidad-relación (proyecto, fases, actividades, hitos, línea base, avances, evidencias, usuarios, roles, notificaciones, auditoría).
- Matriz de roles y permisos.
- Especificación preliminar de la API (contratos de endpoints).

**Criterios de aceptación:** El usuario aprueba stack, modelo de datos y matriz de permisos antes de iniciar infraestructura.

**Pruebas:** Revisión cruzada del modelo de datos contra cada requisito de la Fase 0 (trazabilidad requisito → entidad/endpoint).

**Riesgos/consideraciones:** Elegir mal el mecanismo de 2FA o el modelo de permisos aquí es costoso de corregir después. Confirmar límites reales de Hostinger (recursos del plan contratado, soporte de Docker/Docker Compose, puertos disponibles).

**Requisitos técnicos:** Ninguno aún (solo documentación de diseño).

**Skills aplicables:** `engineering:architecture` (ADRs), `engineering:system-design` (modelo de datos y API).

---

## Fase 2 — Infraestructura Base y Andamiaje del Proyecto

**Objetivo:** Crear el esqueleto del repositorio, la orquestación Docker Compose (app + PostgreSQL + proxy), variables de entorno, y la tubería mínima de calidad de código (linting, formateo, pre-commit).

**Alcance:** Backend y frontend vacíos pero ejecutables ("hello world" funcional), PostgreSQL dockerizado con migraciones iniciales, red interna entre contenedores, configuración de entornos (desarrollo, pruebas, producción).

**Funcionalidades a desarrollar:** Estructura de carpetas backend/frontend, Dockerfiles, `docker-compose.yml` (y variante de producción), sistema de migraciones de base de datos, configuración de linting/formateo, script de arranque local con un solo comando.

**Dependencias:** Fase 1 aprobada.

**Entregables:**
- Repositorio con estructura definida.
- `docker-compose.yml` funcional levantando backend, frontend y PostgreSQL.
- Migraciones iniciales de base de datos (esquema vacío o mínimo).
- README de arranque local.

**Criterios de aceptación:** `docker compose up` levanta todo el stack sin errores en un entorno limpio; la app responde en un endpoint de salud (`/health`).

**Pruebas:** Prueba de arranque desde cero (clonar repo, levantar contenedores, verificar health check). Prueba de reinicio de contenedores sin pérdida de datos de PostgreSQL (volumen persistente).

**Riesgos/consideraciones:** Confirmar compatibilidad de la versión de Docker/Docker Compose disponible en el plan de Hostinger elegido. Definir manejo de secretos (variables de entorno, no hardcodear credenciales).

**Requisitos técnicos:** Docker, Docker Compose, PostgreSQL, gestor de dependencias del backend y del frontend elegidos en Fase 1.

**Skills aplicables:** Ninguna skill dedicada de Docker/PostgreSQL disponible; se documentará explícitamente en el prompt de esta fase.

---

## Fase 3 — Modelo de Datos y Backend Core del Dominio

**Objetivo:** Implementar en base de datos y backend las entidades centrales del dominio: proyecto, fases, actividades, hitos, cronograma, y línea base (con su historial de cambios inmutable).

**Alcance:** Backend puro (sin autenticación todavía, endpoints protegidos temporalmente o detrás de un flag). Incluye la regla de negocio de que la línea base no es editable directamente por colaboradores y que todo cambio queda con fecha original, nueva fecha, usuario, fecha/hora y justificación.

**Funcionalidades a desarrollar:** CRUD de proyecto/fases/actividades/hitos; modelo de línea base con historial de versiones; cálculo de % de avance general y por fase; endpoints de consulta de cronograma.

**Dependencias:** Fase 2 completada y validada.

**Entregables:**
- Esquema de base de datos migrado (tablas de dominio).
- API REST (o GraphQL, según Fase 1) documentada para las entidades de dominio.
- Lógica de cálculo de avance y estado de actividades (pendiente, en ejecución, finalizada, próxima a vencer, vencida).

**Criterios de aceptación:** Se puede crear un proyecto completo con fases, actividades e hitos vía API, y consultar su cronograma y % de avance calculado correctamente. Un cambio de línea base queda registrado con historial completo y no sobrescribe la fecha original.

**Pruebas:** Pruebas unitarias de las reglas de cálculo de avance y estado. Pruebas de integración de los endpoints CRUD. Prueba específica de que la línea base es inmutable salvo por el flujo de cambio autorizado con historial.

**Riesgos/consideraciones:** El cálculo de "próximo a vencer" y "vencido" depende de parámetros configurables (definidos en Fase 0); deben quedar parametrizados, no hardcodeados.

**Requisitos técnicos:** Framework backend y ORM elegidos, PostgreSQL.

**Skills aplicables:** `engineering:system-design` (si se requiere refinar el modelo), `engineering:testing-strategy`.

---

## Fase 4 — Autenticación, Usuarios, Roles y 2FA

**Objetivo:** Implementar el sistema de autenticación de colaboradores: usuario/contraseña, doble factor de autenticación, gestión de usuarios por administradores, roles y permisos, y flujos de activación de cuenta y recuperación de contraseña por correo.

**Alcance:** Backend de autenticación completo (registro por administrador, no autorregistro público), gestión de sesiones/tokens, 2FA (TOTP o el mecanismo definido en Fase 1), flujo de activación de cuenta vía correo, flujo de recuperación de contraseña, RBAC aplicado a nivel de middleware/API.

**Funcionalidades a desarrollar:** Login con contraseña + 2FA; emisión y renovación de sesión/token; CRUD de usuarios (solo administradores); asignación de roles; activación de cuenta por correo; recuperación de contraseña; bloqueo tras intentos fallidos.

**Dependencias:** Fase 3 completada (los usuarios se asociarán después a actividades). Requiere que el servicio de correo esté al menos configurado en modo básico (puede compartirse con el diseño de la Fase 7, pero el flujo mínimo de envío de correos de activación debe existir aquí).

**Entregables:**
- Módulo de autenticación con 2FA funcional.
- CRUD de usuarios y roles restringido a administradores.
- Flujos de activación y recuperación de contraseña vía correo.
- Middleware de autorización por rol aplicado a los endpoints de la Fase 3.

**Criterios de aceptación:** Un administrador puede crear un colaborador, este recibe correo de activación, configura 2FA, inicia sesión correctamente, y no puede acceder a funciones fuera de su rol. Un intento de acceso sin 2FA válido es rechazado.

**Pruebas:** Pruebas de flujo completo de alta de usuario → activación → login con 2FA. Pruebas de control de acceso negativo (intentos de acceso no autorizados por rol). Pruebas de expiración/invalidación de tokens de recuperación de contraseña. Revisión de seguridad de almacenamiento de contraseñas (hashing) y secretos de 2FA.

**Riesgos/consideraciones:** Es la fase de mayor sensibilidad de seguridad del proyecto; requiere revisión de seguridad dedicada antes de continuar. Definir política de expiración de sesión y de recuperación de contraseña.

**Requisitos técnicos:** Librería de hashing de contraseñas, librería TOTP (si aplica), servicio SMTP básico.

**Skills aplicables:** `engineering:code-review` (revisión de seguridad del módulo antes de avanzar). No hay skill dedicada de autenticación/2FA; se documentará en el prompt.

---

## Fase 5 — Asignación de Actividades y Registro de Avances

**Objetivo:** Permitir que administradores asignen actividades a colaboradores, y que los colaboradores registren avances (porcentaje, estado, observaciones) sobre las actividades que tienen asignadas, con trazabilidad completa de quién y cuándo.

**Alcance:** Backend de asignación de actividades por usuario, endpoints de registro de avance restringidos al colaborador asignado (o administrador), historial de avances por actividad.

**Funcionalidades a desarrollar:** Asignación de actividades a uno o varios colaboradores; endpoint de registro de avance (con validaciones de rango de porcentaje y transición de estados válida); historial cronológico de avances por actividad con autor y timestamp; vista de "mis actividades asignadas" por colaborador.

**Dependencias:** Fases 3 y 4 completadas.

**Entregables:**
- Modelo y API de asignación de actividades.
- Modelo y API de registro/histórico de avances.
- Reglas de autorización (un colaborador solo edita lo suyo, salvo administrador).

**Criterios de aceptación:** Un colaborador autenticado solo ve y actualiza las actividades que tiene asignadas; cada avance queda en el historial con usuario y fecha/hora; un administrador puede ver el historial completo de cualquier actividad.

**Pruebas:** Pruebas de autorización (un colaborador no puede modificar actividades ajenas). Pruebas de integridad del historial (no se sobrescriben avances anteriores). Pruebas de validación de datos de entrada (porcentaje fuera de rango, estado inválido).

**Riesgos/consideraciones:** Definir si el % de avance de una actividad se puede editar libremente o solo puede aumentar; esto afecta la lógica de validación.

**Requisitos técnicos:** Backend y base de datos ya establecidos en fases previas.

**Skills aplicables:** `engineering:testing-strategy`.

---

## Fase 6 — Gestión de Evidencias

**Objetivo:** Implementar el módulo de evidencias asociadas a actividades: enlaces/URLs, imágenes, archivos adjuntos y documentos de soporte, con control de visibilidad pública/privada y trazabilidad de quién y cuándo las cargó.

**Alcance:** Backend de carga y almacenamiento de archivos (con el mecanismo de almacenamiento definido en Fase 1), validación de tipos y tamaños de archivo, asociación de evidencias a actividades y avances, bandera de visibilidad pública.

**Funcionalidades a desarrollar:** Endpoint de carga de evidencias (archivo, imagen o enlace); almacenamiento seguro de archivos (fuera del webroot público directo, servidos mediante endpoint controlado); metadatos de evidencia (autor, fecha, observaciones, visibilidad); eliminación/reemplazo de evidencias con control de permisos.

**Dependencias:** Fase 5 completada (las evidencias se asocian a avances/actividades ya existentes).

**Entregables:**
- Módulo de carga y almacenamiento de evidencias.
- API de asociación de evidencias a actividades/avances.
- Control de visibilidad pública/privada aplicado también en la Fase 8 (dashboard público).

**Criterios de aceptación:** Un colaborador puede adjuntar evidencias de distintos tipos a un avance; las evidencias marcadas como públicas son las únicas recuperables sin autenticación; se preserva la trazabilidad de autor y fecha de carga.

**Pruebas:** Pruebas de validación de tipo/tamaño de archivo. Pruebas de control de acceso a evidencias privadas (que no sean accesibles sin autenticación, incluida prueba de acceso directo por URL). Prueba de integridad de archivos tras la carga (checksum).

**Riesgos/consideraciones:** Seguridad de subida de archivos (validación estricta de tipo MIME real, límites de tamaño, escaneo básico si aplica, prevención de path traversal). Espacio en disco/volumen en Hostinger.

**Requisitos técnicos:** Almacenamiento de archivos definido en Fase 1 (volumen Docker o almacenamiento compatible S3).

**Skills aplicables:** `engineering:code-review` (revisión de seguridad de subida de archivos).

---

## Fase 7 — Notificaciones y Alertas por Correo Electrónico

**Objetivo:** Implementar el sistema automático de notificaciones: alertas de actividades próximas a vencer, vencidas, confirmaciones de registro de avances, y notificaciones de cambios importantes, con parámetros configurables de anticipación.

**Alcance:** Servicio/worker programado (scheduler) que evalúa el cronograma diariamente (o con la frecuencia definida), plantillas de correo, configuración de anticipación (7/3/1 días u otros valores definidos por administradores), registro de notificaciones enviadas para evitar duplicados.

**Funcionalidades a desarrollar:** Job programado de evaluación de vencimientos; envío de correos de alerta próxima a vencer/vencida; correo de confirmación de registro de avance; panel de configuración de reglas de notificación para administradores; log de notificaciones enviadas.

**Dependencias:** Fases 4, 5 y 6 completadas (se notifica sobre usuarios, actividades y avances ya existentes).

**Entregables:**
- Worker/scheduler de notificaciones.
- Plantillas de correo (activación, recuperación, próximo a vencer, vencido, confirmación de avance, cambio importante).
- Configuración administrable de anticipación de alertas.
- Registro de notificaciones enviadas (para auditoría y para evitar envíos duplicados).

**Criterios de aceptación:** Una actividad configurada para vencer en N días genera la alerta correspondiente exactamente una vez por umbral configurado; los correos llegan con contenido correcto y enlaces funcionales al recurso correspondiente.

**Pruebas:** Pruebas del job de evaluación con fechas simuladas (actividades a 7, 3, 1 día y vencidas). Prueba de no duplicación de alertas. Prueba de entrega real a un proveedor SMTP de pruebas.

**Riesgos/consideraciones:** Elegir proveedor SMTP compatible con Hostinger; manejar límites de envío y reintentos ante fallos; evitar que el scheduler dependa de que un usuario tenga el navegador abierto (debe ser un proceso de servidor independiente).

**Requisitos técnicos:** Proveedor SMTP, mecanismo de tareas programadas (cron interno del contenedor o librería de scheduling del framework).

**Skills aplicables:** Ninguna skill dedicada de notificaciones por correo; se documentará en el prompt.

---

## Fase 8 — Auditoría y Trazabilidad

**Objetivo:** Implementar el registro centralizado de auditoría: toda acción relevante de creación, modificación o eliminación queda registrada con usuario, fecha/hora, tipo de acción y detalle del cambio (antes/después cuando aplique).

**Alcance:** Capa transversal (middleware/interceptor) que registra eventos de auditoría desde los módulos ya construidos (usuarios, actividades, avances, evidencias, línea base, notificaciones), y un endpoint/panel de consulta de auditoría para administradores.

**Funcionalidades a desarrollar:** Tabla/almacén de eventos de auditoría; captura automática de eventos desde los módulos existentes; endpoint de consulta filtrable (por usuario, entidad, rango de fechas, tipo de acción); protección de que el log de auditoría sea de solo lectura para todos los roles salvo consulta.

**Dependencias:** Fases 3 a 7 completadas (para auditar todo lo que ya existe).

**Entregables:**
- Módulo de auditoría transversal.
- Panel/API de consulta de auditoría para administradores.
- Verificación retroactiva de que los módulos de fases anteriores emiten eventos de auditoría.

**Criterios de aceptación:** Cada acción de creación/edición/eliminación en los módulos existentes genera un evento de auditoría consultable, inmutable y atribuible a un usuario.

**Pruebas:** Pruebas de generación de eventos para cada tipo de acción crítica. Prueba de que el log de auditoría no puede alterarse ni eliminarse desde la API. Prueba de rendimiento de la consulta de auditoría con volumen simulado.

**Riesgos/consideraciones:** El volumen de eventos puede crecer rápido; considerar índices y política de retención/archivado a futuro.

**Requisitos técnicos:** Tabla de auditoría en PostgreSQL, mecanismo de interceptación (middleware, hooks de ORM o triggers de base de datos, según lo definido en Fase 1).

**Skills aplicables:** `engineering:system-design` si se requiere ajustar el modelo de auditoría.

---

## Fase 9 — Frontend: Dashboard Público

**Objetivo:** Construir la interfaz pública (sin autenticación) que muestra la información general del proyecto: objetivos, fases, actividades, cronograma, % de avance, hitos, indicadores, actividades por vencer/vencidas, línea base vs. ejecución real, y evidencias públicas.

**Alcance:** Frontend consumiendo exclusivamente los endpoints públicos ya construidos en fases anteriores. Diseño responsivo, accesible, optimizado para consulta rápida de estado.

**Funcionalidades a desarrollar:** Página principal del proyecto; vista de cronograma/línea de tiempo; indicadores visuales de avance (gráficos, barras, semáforos de estado); listado de hitos; listado de evidencias públicas por actividad; vista comparativa línea base vs. ejecución.

**Dependencias:** Fases 3, 6 y 8 completadas (se necesitan datos de dominio, evidencias públicas y, opcionalmente, indicadores derivados de auditoría de avance).

**Entregables:**
- Dashboard público desplegable de forma independiente o integrada.
- Componentes de visualización de cronograma e indicadores.

**Criterios de aceptación:** Cualquier visitante sin sesión puede ver el estado completo del proyecto según lo especificado en la Fase 0, sin ver evidencias ni datos marcados como privados.

**Pruebas:** Pruebas de que ningún dato privado se filtra en las respuestas consumidas por el dashboard público. Pruebas de accesibilidad y de carga en dispositivos móviles. Pruebas E2E de navegación del dashboard.

**Riesgos/consideraciones:** Cuidado especial en no exponer accidentalmente datos privados vía la misma API que alimenta el dashboard público (debe usar endpoints explícitamente públicos, no un filtrado del lado del cliente).

**Requisitos técnicos:** Framework frontend elegido en Fase 1, librería de gráficos.

**Skills aplicables:** `web-design-guidelines`, `dataviz` (si se usan gráficos), `qa-playwright` (E2E).

---

## Fase 10 — Frontend: Panel de Colaboradores y Administración

**Objetivo:** Construir la interfaz privada para colaboradores (registro de avances, evidencias, actividades asignadas) y administradores (gestión de usuarios, asignación de actividades, control de cambios de línea base, configuración de notificaciones, consulta de auditoría).

**Alcance:** Frontend autenticado, con login + 2FA, control de acceso por rol reflejado en la interfaz (ocultar/mostrar funciones), formularios de registro de avance y carga de evidencias, panel administrativo completo.

**Funcionalidades a desarrollar:** Pantallas de login y configuración de 2FA; "mis actividades" para colaboradores; formulario de registro de avance con carga de evidencias; panel de administración de usuarios y roles; panel de asignación de actividades; panel de gestión de línea base y control de cambios; panel de configuración de alertas; panel de consulta de auditoría.

**Dependencias:** Fases 4 a 9 completadas.

**Entregables:**
- Aplicación frontend privada completa.
- Integración con todos los módulos backend construidos.

**Criterios de aceptación:** Un colaborador puede completar el flujo descrito en el documento original (login → 2FA → ver actividades → registrar avance → adjuntar evidencia → guardar) de principio a fin sin errores. Un administrador puede completar la gestión de usuarios, asignación y supervisión descrita.

**Pruebas:** Pruebas E2E de los flujos de colaborador y administrador. Pruebas de que la interfaz respeta estrictamente los permisos por rol (no solo oculta botones, sino que el backend rechaza igualmente acciones no autorizadas). Pruebas de usabilidad básicas.

**Riesgos/consideraciones:** Mantener consistencia entre validaciones de frontend y backend; el frontend nunca debe ser el único control de seguridad.

**Requisitos técnicos:** Framework frontend, librería de manejo de formularios y de estado.

**Skills aplicables:** `web-design-guidelines`, `qa-playwright`.

---

## Fase 11 — Integración End-to-End y Pruebas de Sistema

**Objetivo:** Validar el sistema completo integrado (frontend público + frontend privado + backend + base de datos + notificaciones + auditoría) como un todo coherente, cerrando brechas de integración entre módulos construidos de forma incremental.

**Alcance:** Pruebas de extremo a extremo sobre el stack completo levantado vía Docker Compose, cubriendo los flujos generales descritos en el documento original (visitante, colaborador, sistema, administrador).

**Funcionalidades a desarrollar:** Ninguna nueva; esta fase es de integración y pruebas. Puede generar correcciones puntuales de bugs de integración.

**Dependencias:** Fases 1 a 10 completadas.

**Entregables:**
- Suite de pruebas E2E automatizadas cubriendo los cuatro flujos del documento original.
- Informe de bugs encontrados y corregidos.
- Ambiente de staging funcional (réplica de producción) para validación final.

**Criterios de aceptación:** Los cuatro flujos generales (visitante, colaborador, sistema de notificaciones, administrador) funcionan de principio a fin en un ambiente que replica producción, sin errores críticos abiertos.

**Pruebas:** Suite E2E completa; pruebas de carga básica (usuarios concurrentes esperados); pruebas de regresión sobre todos los módulos previos.

**Riesgos/consideraciones:** Esta fase suele revelar supuestos incorrectos entre módulos construidos por separado; se debe reservar tiempo de buffer.

**Requisitos técnicos:** Ambiente de staging dockerizado.

**Skills aplicables:** `engineering:testing-strategy`, `qa-playwright`.

---

## Fase 12 — Hardening de Seguridad

**Objetivo:** Realizar una revisión de seguridad dedicada sobre todo el sistema antes de producción: autenticación, autorización, subida de archivos, exposición de datos, cabeceras HTTP, dependencias vulnerables, y configuración de contenedores.

**Alcance:** Auditoría de seguridad transversal a todo lo construido en fases 1-11, no desarrollo de nuevas funcionalidades salvo remediaciones.

**Funcionalidades a desarrollar:** Remediación de hallazgos (por ejemplo: cabeceras de seguridad HTTP, rate limiting en login y 2FA, protección CSRF/XSS/SQLi, revisión de permisos de archivos en contenedores, escaneo de dependencias).

**Dependencias:** Fase 11 completada.

**Entregables:**
- Informe de auditoría de seguridad con hallazgos clasificados por severidad.
- Remediaciones aplicadas y verificadas.
- Checklist de seguridad de referencia para mantenimiento futuro.

**Criterios de aceptación:** No quedan hallazgos de severidad alta o crítica sin remediar; el sistema pasa las pruebas de seguridad definidas.

**Pruebas:** Pruebas de penetración básicas (login, 2FA, control de acceso, subida de archivos); escaneo automatizado de dependencias vulnerables; pruebas de rate limiting.

**Riesgos/consideraciones:** No saltarse esta fase por presión de tiempo; es la última barrera antes de exponer el sistema públicamente.

**Requisitos técnicos:** Herramientas de escaneo de dependencias y de pruebas de seguridad básicas.

**Skills aplicables:** `engineering:code-review` con foco en seguridad.

---

## Fase 13 — Preparación de Despliegue en Hostinger

**Objetivo:** Configurar el entorno de producción en Hostinger: Docker Compose de producción, dominio/subdominio, certificados TLS, variables de entorno de producción, proxy inverso, y procedimiento de despliegue reproducible.

**Alcance:** Infraestructura de producción, no desarrollo de funcionalidades.

**Funcionalidades a desarrollar:** `docker-compose.prod.yml`; configuración de reverse proxy con TLS (Let's Encrypt u otro); scripts de despliegue; configuración de variables de entorno productivas (SMTP real, secretos, dominio); pipeline de despliegue (manual documentado o CI/CD según lo definido).

**Dependencias:** Fase 12 completada (sistema ya endurecido en seguridad).

**Entregables:**
- Ambiente de producción funcional en Hostinger, accesible por el dominio definitivo.
- Documentación del procedimiento de despliegue y rollback.
- Checklist de despliegue ejecutado.

**Criterios de aceptación:** La plataforma es accesible públicamente en el dominio de producción; el dashboard público carga correctamente; un colaborador de prueba puede iniciar sesión con 2FA en producción; los correos se envían correctamente desde producción.

**Pruebas:** Ejecución del checklist de despliegue; prueba de humo (smoke test) post-despliegue de los flujos críticos; verificación de certificado TLS válido.

**Riesgos/consideraciones:** Confirmar con antelación los recursos y limitaciones reales del plan de Hostinger (RAM, CPU, soporte de Docker, puertos). Tener plan de rollback documentado.

**Requisitos técnicos:** Cuenta y plan de Hostinger con soporte Docker, dominio configurado, proveedor SMTP de producción.

**Skills aplicables:** `engineering:deploy-checklist`.

---

## Fase 14 — Respaldos, Recuperación y Monitoreo

**Objetivo:** Implementar la estrategia de respaldo automático de base de datos y evidencias, procedimiento de recuperación ante desastres, y monitoreo básico de salud del sistema en producción.

**Alcance:** Infraestructura operativa post-despliegue.

**Funcionalidades a desarrollar:** Job de respaldo automático de PostgreSQL (frecuencia y retención definidas); respaldo de archivos de evidencias; procedimiento documentado y probado de restauración; monitoreo básico (health checks, alertas de caída del servicio, uso de disco).

**Dependencias:** Fase 13 completada (sistema ya en producción).

**Entregables:**
- Job de respaldo automatizado funcionando en producción.
- Procedimiento de recuperación probado con un respaldo real (restauración de prueba).
- Monitoreo básico configurado con alertas al administrador.

**Criterios de aceptación:** Un respaldo reciente puede restaurarse exitosamente en un ambiente aislado, reconstruyendo el estado completo del sistema (datos y evidencias). Las alertas de caída de servicio llegan correctamente.

**Pruebas:** Simulacro de recuperación ante desastres (restauración completa desde respaldo). Prueba de alerta de monitoreo ante caída simulada del servicio.

**Riesgos/consideraciones:** Un respaldo nunca probado no es un respaldo confiable; el simulacro de restauración es obligatorio, no opcional.

**Requisitos técnicos:** Espacio de almacenamiento externo o dentro de Hostinger para respaldos, herramienta de monitoreo básico.

**Skills aplicables:** `engineering:incident-response` (para el procedimiento de recuperación y respuesta ante caídas).

---

## Fase 15 — Documentación Final y Cierre

**Objetivo:** Consolidar toda la documentación técnica y de usuario necesaria para la operación, mantenimiento y evolución futura de la plataforma.

**Alcance:** Documentación, no desarrollo.

**Funcionalidades a desarrollar:** Manual de administrador (gestión de usuarios, configuración de alertas, gestión de línea base); manual de colaborador (registro de avances y evidencias); documentación técnica de arquitectura final; runbook operativo (despliegue, respaldo, recuperación, incidentes); documentación de la API.

**Dependencias:** Fases 13 y 14 completadas.

**Entregables:**
- Manual de usuario para colaboradores y administradores.
- Documentación técnica y runbook operativo.
- Documentación de API actualizada al estado final del sistema.

**Criterios de aceptación:** Un nuevo administrador o colaborador puede operar la plataforma siguiendo únicamente la documentación entregada, sin soporte adicional.

**Pruebas:** Revisión de que la documentación es ejecutable paso a paso (dry-run de un tercero siguiendo el manual).

**Riesgos/consideraciones:** Documentación desactualizada respecto al sistema real es un riesgo operativo silencioso; debe revisarse contra el estado final desplegado.

**Requisitos técnicos:** Ninguno adicional.

**Skills aplicables:** `engineering:documentation`.

---

## Resumen del orden de ejecución

Fase 0 (Requisitos) → Fase 1 (Arquitectura) → Fase 2 (Infraestructura base) → Fase 3 (Dominio: proyecto/cronograma/línea base) → Fase 4 (Autenticación/2FA/roles) → Fase 5 (Asignación y avances) → Fase 6 (Evidencias) → Fase 7 (Notificaciones por correo) → Fase 8 (Auditoría y trazabilidad) → Fase 9 (Frontend público) → Fase 10 (Frontend privado/admin) → Fase 11 (Integración E2E) → Fase 12 (Hardening de seguridad) → Fase 13 (Despliegue en Hostinger) → Fase 14 (Respaldos y monitoreo) → Fase 15 (Documentación y cierre).

## Próximos pasos

Este plan maestro queda a la espera de aprobación. Una vez aprobado (con o sin ajustes), se procederá a generar el prompt especializado en Markdown con etiquetas XML para la Fase 0, identificando previamente si aplica alguna skill adicional no contemplada aquí.
