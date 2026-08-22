# Prompt para Claude Code — Fase 1: Arquitectura y Diseño Técnico

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Depende de:** Fase 0 aprobada por el usuario (22-ago-2026). Documentos base en `docs/fase-0-requisitos/`.
**Skills de Claude recomendadas:** `engineering:architecture` (para los ADRs / decisiones de diseño) y `engineering:system-design` (para el modelo de datos y el diseño de API). No se usan skills de implementación (backend, frontend, Docker, testing) en esta fase: la Fase 1 es de **diseño, no de código**.

Copia y pega el bloque completo de abajo (desde `<role>` hasta `</deliverables>`) directamente en Claude Code.

---

```xml
<role>
Eres un arquitecto de software senior, actuando dentro de Claude Code como responsable de la Fase 1 de un proyecto de desarrollo. Tu responsabilidad es diseñar la arquitectura completa del sistema y documentarla, SIN escribir código de aplicación ni levantar infraestructura todavía. Cada decisión técnica relevante debe quedar registrada como un ADR (Architecture Decision Record) con contexto, opciones consideradas, decisión y consecuencias. Trabajas con trazabilidad estricta: cada requisito de la Fase 0 debe poder mapearse a una entidad de datos, un endpoint o un componente de la arquitectura. Cuando una decisión dependa de un dato que aún no tienes, la registras como supuesto explícito y como pregunta al usuario, nunca como una elección silenciosa.
</role>

<context>
La Fase 0 (Descubrimiento y Definición de Requisitos) fue aprobada por el usuario. Sus documentos son la fuente de verdad funcional y están en `docs/fase-0-requisitos/`:
- `01-glosario.md` — términos del dominio (Proyecto, Fase, Actividad, Hito, Línea Base, Avance, Evidencia, Colaborador, Administrador, Visitante, Notificación, Alerta, Auditoría).
- `02-actores-y-casos-de-uso.md` — 4 actores (Visitante, Colaborador, Administrador, Sistema de Notificaciones) y 10 casos de uso (CU-01 a CU-10).
- `03-reglas-de-negocio.md` — reglas verificables (RN-01 a RN-18).
- `04-requisitos-no-funcionales.md` — RNF y subsección de seguridad.
- `05-preguntas-abiertas.md` — preguntas ya respondidas y las no bloqueantes aún abiertas.

La plataforma monitorea UN ÚNICO proyecto: un Dashboard Público de solo lectura (sin autenticación) y un área privada para Colaboradores y Administradores autenticados. El proyecto real es el Plan de Acción Climática (PAC) de Medellín, con 6 componentes estratégicos y 18 entregables.

DECISIONES DE NEGOCIO YA TOMADAS EN LA FASE 0 (son entradas fijas de esta fase; no las reabras, diséñalas):
- Jerarquía: Proyecto → Fases → Actividades. Un Hito pertenece a una Actividad (RN-01).
- Cálculo de Avance (RN-02): Fase = promedio simple de sus Actividades; Proyecto = suma ponderada de las Fases por su peso (los pesos de las Fases suman 100 %); Actividad con varios Colaboradores = suma ponderada por el peso de trabajo de cada Colaborador (suman 100 %).
- El Avance de una Actividad puede subir y bajar; todo cambio queda en el histórico (RN-05).
- Línea Base inmutable salvo cambio autorizado que conserva fecha original, nueva fecha, autor, fecha/hora, justificación e historial completo (RN-07).
- Evidencias: el Dashboard Público muestra toda la información del Proyecto, pero el contenido/enlace de cualquier Evidencia solo es accesible autenticado; no existe Evidencia Pública (RN-06, RN-13).
- Multiasignación de Actividades permitida, con pesos de trabajo por Colaborador (RN-08).
- Conservación por trazabilidad: Avances y Evidencias de Usuarios desactivados/eliminados no se borran (RN-14).
- Notificaciones por correo con anticipación configurable y sin duplicar Alertas (RN-11).
- Auditoría inmutable de acciones y accesos a datos sensibles; contraseñas nunca en texto plano (RN-16, RN-17, RN-18).

RESTRICCIONES TÉCNICAS DADAS (entradas fijas, no se debaten):
- Despliegue en Hostinger, con Docker y PostgreSQL dockerizado.
- 2FA mediante Microsoft Authenticator (aplicación autenticadora).
- Envío de correo mediante una cuenta Office 365 / Microsoft 365 conectada a la aplicación.
- Cumplimiento de la Ley 1581 de 2012 de Colombia (protección de datos personales / habeas data).

PREGUNTAS NO BLOQUEANTES aún abiertas de la Fase 0 (a tener presentes; si una decisión de arquitectura depende de ellas, deja el diseño parametrizado y regístralas): PA-08 y PA-12 (umbrales y anticipación de vencimiento), PA-15 (campos obligatorios), PA-16 (qué es un "cambio importante"), PA-18 (política de contraseñas), PA-23 (¿Fase = componente estratégico?), PA-24 (unificar tipos de archivo de Evidencia), y las de dimensionamiento y plan/dominio de Hostinger (PA-01 a PA-07, PA-20, PA-21).
</context>

<objective>
Producir el diseño técnico completo del sistema, aprobable por el usuario, que sirva de base inequívoca para la Fase 2 (Infraestructura). El diseño debe: (1) fijar el stack tecnológico mediante ADRs justificados; (2) definir el modelo de datos conceptual que soporte todas las reglas de negocio de la Fase 0; (3) especificar los contratos de API principales; (4) definir la matriz de roles y permisos (RBAC); (5) describir la arquitectura de contenedores y la estrategia de despliegue en Docker sobre Hostinger; y (6) demostrar trazabilidad de cada requisito de la Fase 0 hacia el diseño. Es diseño, no implementación: no se escribe código de aplicación ni se levanta infraestructura.
</objective>

<tasks>
1. Leer íntegramente los documentos de `docs/fase-0-requisitos/` y tomarlos como fuente de verdad funcional. Ante cualquier conflicto entre este prompt y esos documentos, prevalecen los documentos de la Fase 0 (y se reporta el conflicto).
2. Redactar los ADRs de las decisiones tecnológicas clave, cada uno con: contexto, opciones consideradas (mínimo dos), decisión, justificación y consecuencias. Como mínimo:
   - Framework/lenguaje de backend.
   - Framework/lenguaje de frontend.
   - Mecanismo de acceso a datos (ORM / query builder) sobre PostgreSQL.
   - Estrategia de autenticación de sesión y de segundo factor, integrando Microsoft Authenticator como app de 2FA (definir el protocolo concreto: TOTP estándar u otra integración compatible).
   - Almacenamiento de archivos de Evidencia (volumen Docker en el host vs. almacenamiento compatible con S3), considerando que el contenido de las Evidencias nunca es público.
   - Motor de tareas programadas (scheduler) para el Sistema de Notificaciones, como proceso de servidor independiente del navegador.
   - Envío de correo transaccional a través de Office 365 / Microsoft 365 (definir la vía: SMTP autenticado de Microsoft 365 u otra compatible) y manejo de credenciales.
   - Estrategia de despliegue con Docker/Docker Compose sobre Hostinger (contenedores, red, volúmenes, reverse proxy, TLS) a nivel de diseño.
3. Diseñar el modelo de datos conceptual (entidad-relación) que soporte TODAS las reglas de la Fase 0. Debe incluir al menos: Proyecto, Fase (con su peso), Actividad (con estado y fechas), Hito (asociado a Actividad), Línea Base y su historial de cambios inmutable, Avance (histórico, con autor y fecha/hora), Asignación Actividad–Colaborador (con peso de trabajo), Evidencia (con tipo y visibilidad de contenido restringida), Usuario, Rol, Notificación/Alerta enviada, y Evento de Auditoría. Representar el diagrama en Mermaid (erDiagram) y describir cada entidad, sus atributos clave y sus relaciones/cardinalidades. Explicitar cómo el modelo garantiza: cálculo de Avance (RN-02), inmutabilidad de la Línea Base (RN-07), histórico de Avances (RN-05, RN-10), pesos que suman 100 % (RN-02, RN-08), y auditoría inmutable (RN-18).
4. Especificar de forma preliminar los contratos de la API principal (endpoints por caso de uso CU-01 a CU-10): método, ruta, autenticación requerida, parámetros/cuerpo, respuesta y errores relevantes. Separar claramente los endpoints PÚBLICOS (que alimentan el Dashboard Público, sin exponer contenido de Evidencias) de los endpoints AUTENTICADOS. Puede expresarse como tabla de contratos y/o fragmento OpenAPI preliminar.
5. Definir la matriz de roles y permisos (RBAC) para Visitante (no autenticado), Colaborador y Administrador, cruzando cada rol contra cada operación relevante (consultar dashboard, login+2FA, gestionar usuarios, asignar actividades, registrar avance, cargar evidencia, cambiar línea base, configurar alertas, consultar auditoría). El control debe ser de servidor, no solo de interfaz.
6. Describir la arquitectura de contenedores: componentes (frontend, backend/API, PostgreSQL, worker/scheduler de notificaciones, reverse proxy), su comunicación, la red interna, los volúmenes persistentes (datos de PostgreSQL y archivos de Evidencia), y el flujo de una petición pública vs. una autenticada. Representar el diagrama en Mermaid.
7. Elaborar la matriz de trazabilidad requisito → diseño: para cada RN y cada RNF de la Fase 0, indicar qué entidad(es), endpoint(s) y/o componente(s) lo soportan. Si algún requisito no encuentra soporte, es un defecto de diseño y debe corregirse antes de entregar.
8. Registrar los supuestos de arquitectura y las preguntas abiertas dependientes de las no bloqueantes de la Fase 0 (dimensionamiento, política de contraseñas, umbrales configurables, etc.), dejando el diseño parametrizado donde aplique.
9. Consolidar todo en los documentos de `<files>`. NO escribir código de aplicación, NO crear Dockerfiles ni docker-compose reales, NO ejecutar migraciones: eso es Fase 2.
</tasks>

<architecture>
Esta fase PRODUCE la arquitectura, pero solo como documentación de diseño (ADRs, diagramas Mermaid, modelo de datos conceptual, contratos de API, matriz RBAC). Las restricciones dadas (Hostinger, Docker, PostgreSQL, Microsoft Authenticator para 2FA, Office 365 para correo, Ley 1581) son entradas fijas: se diseñan e integran, no se reabren. Cualquier decisión de stack aún no fijada se resuelve aquí mediante un ADR justificado, marcando que requiere aprobación del usuario. No se implementa nada ejecutable.
</architecture>

<technologies>
Puedes y debes proponer tecnologías concretas (lenguajes, frameworks, ORM, librería de 2FA compatible con Microsoft Authenticator, reverse proxy, mecanismo de scheduler), siempre como ADR con alternativas y justificación, y siempre respetando las restricciones dadas: PostgreSQL como base de datos, Docker/Docker Compose para orquestación, Hostinger como destino de despliegue, Microsoft Authenticator para 2FA, Office 365 para correo. No se instala ni configura nada todavía; solo se decide y documenta.
</technologies>

<files>
Crea los siguientes archivos Markdown dentro de una carpeta `docs/fase-1-arquitectura/` en la raíz del repositorio (créala si no existe):

- `docs/fase-1-arquitectura/00-resumen-arquitectura.md` — resumen ejecutivo del diseño, con enlaces al resto y lista de decisiones que requieren aprobación del usuario.
- `docs/fase-1-arquitectura/01-adrs.md` — todos los ADRs de esta fase (o una carpeta `01-adr/` con un archivo por ADR si prefieres; en ese caso, indícalo en el resumen).
- `docs/fase-1-arquitectura/02-modelo-datos.md` — modelo entidad-relación (diagrama Mermaid + descripción de entidades, atributos y relaciones).
- `docs/fase-1-arquitectura/03-api-preliminar.md` — contratos de API por caso de uso, separando endpoints públicos y autenticados.
- `docs/fase-1-arquitectura/04-matriz-roles-permisos.md` — matriz RBAC de roles vs. operaciones.
- `docs/fase-1-arquitectura/05-arquitectura-contenedores.md` — diagrama de contenedores (Mermaid) y descripción de despliegue en Docker sobre Hostinger.
- `docs/fase-1-arquitectura/06-trazabilidad-requisitos.md` — matriz de trazabilidad requisito (RN/RNF) → entidad/endpoint/componente.

No modifiques los documentos de la Fase 0 ni crees código de aplicación en esta fase.
</files>

<rules>
- Los documentos de la Fase 0 son la fuente de verdad funcional; no los contradigas. Si detectas un conflicto, regístralo como hallazgo en el resumen, no lo resuelvas por tu cuenta.
- Usa exactamente la terminología del `01-glosario.md` de la Fase 0.
- Toda decisión técnica relevante va como ADR con opciones consideradas y consecuencias; nada de decisiones sin justificar.
- Respeta las restricciones dadas (PostgreSQL, Docker, Hostinger, Microsoft Authenticator, Office 365, Ley 1581) como fijas.
- No inventes cifras de dimensionamiento no provistas: si el diseño depende de ellas, parametriza y remite a la pregunta abierta correspondiente.
- Todos los diagramas en Mermaid dentro del Markdown (no imágenes externas).
- Escribe todo en español, Markdown limpio, sin XML dentro de los entregables.
- No cierres la fase como completa hasta que el usuario apruebe explícitamente stack, modelo de datos y matriz de permisos. Deja esto explícito al final del resumen.
</rules>

<security>
El diseño debe materializar las bases de seguridad fijadas en la Fase 0:
- 2FA obligatorio para todo Colaborador y Administrador, mediante Microsoft Authenticator; diseñar el flujo de enrolamiento y verificación del segundo factor.
- Contraseñas nunca en texto plano: el ADR de autenticación debe definir el enfoque de almacenamiento con hashing (algoritmo concreto y sus parámetros) y el manejo del secreto de 2FA.
- El contenido/enlace de las Evidencias nunca accesible sin autenticación (ni por URL directa): el diseño de almacenamiento y de endpoints debe servir las Evidencias solo a través de un endpoint autenticado y autorizado, nunca desde una ruta pública directa.
- Auditoría inmutable: el modelo de datos debe impedir la modificación/eliminación de eventos de auditoría desde la aplicación, y registrar accesos/modificaciones a datos sensibles.
- Cumplimiento de la Ley 1581 de 2012: reflejar en el diseño cómo se soportan el consentimiento y el deber de información, los derechos del titular (consulta, actualización, rectificación, supresión) sobre sus datos personales, y las medidas de seguridad; señalar qué datos se consideran personales y su tratamiento.
- Diseñar previendo controles que se endurecerán en la Fase 12 (rate limiting en login/2FA, cabeceras de seguridad, protección CSRF/XSS/SQLi), sin implementarlos aún.
</security>

<testing>
Esta fase no produce código ejecutable; su validación es por revisión:
1. Trazabilidad completa: cada RN (RN-01 a RN-18) y cada RNF de la Fase 0 debe aparecer en `06-trazabilidad-requisitos.md` mapeado a al menos una entidad, endpoint o componente. Un requisito sin soporte es un defecto y se corrige antes de entregar.
2. Cobertura de casos de uso: cada CU (CU-01 a CU-10) debe tener al menos un contrato de endpoint en `03-api-preliminar.md`.
3. Consistencia de permisos: la matriz RBAC de `04` no debe permitir a un Visitante ni a un Colaborador ninguna operación que las reglas de la Fase 0 les prohíben (p. ej. Colaborador no modifica Línea Base; Visitante no accede a contenido de Evidencias).
4. Coherencia del modelo de datos con las reglas de cálculo de Avance, la inmutabilidad de Línea Base y Auditoría, y la conservación de datos de Usuarios desactivados.
</testing>

<acceptance_criteria>
- Existen los siete documentos de `docs/fase-1-arquitectura/` con el contenido descrito.
- Todas las decisiones de stack están justificadas como ADRs con alternativas y consecuencias.
- El modelo de datos soporta cada regla de negocio de la Fase 0, verificado en la matriz de trazabilidad.
- Cada caso de uso CU-01 a CU-10 tiene contrato de API; los endpoints públicos no exponen contenido de Evidencias.
- La matriz RBAC es coherente con los permisos de la Fase 0.
- La arquitectura de contenedores es viable sobre Docker en Hostinger, con volúmenes persistentes para PostgreSQL y para archivos de Evidencia.
- Ningún entregable contiene código de aplicación ni infraestructura ejecutable.
- El usuario revisa y aprueba explícitamente stack, modelo de datos y matriz de permisos antes de considerar cerrada la Fase 1.
</acceptance_criteria>

<deliverables>
1. `docs/fase-1-arquitectura/00-resumen-arquitectura.md` — resumen del diseño, enlaces y decisiones que requieren aprobación.
2. `docs/fase-1-arquitectura/01-adrs.md` — ADRs de las decisiones tecnológicas clave.
3. `docs/fase-1-arquitectura/02-modelo-datos.md` — modelo entidad-relación (Mermaid + descripción).
4. `docs/fase-1-arquitectura/03-api-preliminar.md` — contratos de API por caso de uso.
5. `docs/fase-1-arquitectura/04-matriz-roles-permisos.md` — matriz RBAC.
6. `docs/fase-1-arquitectura/05-arquitectura-contenedores.md` — diagrama de contenedores y estrategia de despliegue.
7. `docs/fase-1-arquitectura/06-trazabilidad-requisitos.md` — trazabilidad requisito → diseño.
8. Un mensaje final de Claude Code resumiendo, en un párrafo, las decisiones de arquitectura tomadas y las 3-5 que más necesitan tu aprobación antes de pasar a la Fase 2 (Infraestructura).
</deliverables>
```

---

## Antes de usar este prompt

Este prompt ya incorpora las decisiones aprobadas en la Fase 0 (jerarquía y cálculo de avance, evidencias privadas de contenido, línea base inmutable, Microsoft Authenticator para 2FA, Office 365 para correo, Ley 1581, y despliegue en Hostinger con Docker y PostgreSQL). No necesitas pegar nada adicional: la Fase 1 leerá directamente `docs/fase-0-requisitos/`.

Si antes de ejecutar la Fase 1 quieres cerrar alguna pregunta no bloqueante (por ejemplo, la política de contraseñas —PA-18—, los umbrales de vencimiento —PA-08/PA-12—, o el plan/dominio de Hostinger —PA-20/PA-21—), respóndelas y se reflejarán en los ADRs correspondientes; si no, el diseño quedará parametrizado y se decidirán en su momento.

## Después de ejecutar esta fase en Claude Code

1. Revisa los siete documentos generados en `docs/fase-1-arquitectura/`.
2. Aprueba (o ajusta) especialmente el stack tecnológico, el modelo de datos y la matriz de roles y permisos.
3. Cuando apruebes, dímelo y preparo el prompt de la **Fase 2 — Infraestructura Base y Andamiaje del Proyecto**.
