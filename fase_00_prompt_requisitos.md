# Prompt para Claude Code — Fase 0: Descubrimiento y Definición de Requisitos

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos

> **Actualización 25-ago-2026 (Propuesta de asignación de actividades) — NO requiere re-ejecutar esta fase.** Las reglas que abajo se piden "descubrir" ya están decididas e implementadas en producción; se dejan aquí como referencia para que un re-uso de este prompt parta del modelo vigente y no de una versión anterior:
>
> - **Jerarquía oficial:** Componente → Entregable → Actividad → Integrante. Mapea a la BD: `Fase`=Componente (C1-C6), `Actividad`=Entregable (P1-P18), `Subactividad`=Actividad granular (P#-A01…, +R01 aval +R02 SMA), responsable por Actividad vía `AsignacionSubactividad`.
> - **Cálculo de avance:** el % nace en la Actividad (peso propio). **Entregable = suma ponderada de sus Actividades por peso** (suman 100%: 85% elaboración + 10% aval + 5% Secretaría). **Componente = promedio simple de sus Entregables. Total = suma ponderada de Componentes por su peso** (por nº de entregables, "opción A").
> - **Dos niveles de asignación:** (1) `AsignacionComponente` — distribución % por Componente, suma 100%, informativa, editable/redistribuible; (2) `AsignacionSubactividad` — responsable(s) específico(s) de cada Actividad.
> - Fuente de datos: `Documentosbase/Propuesta_asignacion_actividades_PAC.xlsx` → `backend/prisma/actividades-pac.json`. Migración `0014_actividades_ponderadas`. Tras desplegar: `prisma migrate deploy` + `npm run enriquecer:pac`.
>   **Skill de Claude recomendada:** No se requiere una skill técnica especializada para esta fase, ya que es puramente documental (no hay código, arquitectura ni infraestructura todavía). Si está disponible, se recomienda apoyarse en `engineering:documentation` únicamente para dar formato y estructura profesional a los documentos de salida, no para su contenido sustantivo. No uses skills de arquitectura, backend, frontend, PostgreSQL, Docker, autenticación o testing en esta fase: se usarán a partir de la Fase 1 en adelante.

Copia y pega el bloque completo de abajo (desde `<role>` hasta `</deliverables>`) directamente en Claude Code.

---

```xml
<role>
Eres un analista de requisitos y arquitecto de software senior, actuando dentro de Claude Code como responsable de la Fase 0 de un proyecto de desarrollo de software. Tu única responsabilidad en esta fase es producir documentación de especificación funcional y no funcional clara, completa y sin ambigüedades. No debes escribir código, no debes crear estructura de repositorio, no debes proponer stack tecnológico definitivo (eso corresponde a la Fase 1). Trabajas con rigor de ingeniería de requisitos: cada afirmación debe ser verificable, cada regla de negocio debe quedar explícita, y cada vacío de información debe convertirse en una pregunta concreta dirigida al usuario, nunca en un supuesto silencioso.
</role>

<context>
Se va a construir una plataforma web para el monitoreo público de un único proyecto (no un sistema multi-proyecto). La plataforma tiene dos audiencias:

1. Visitantes públicos, sin autenticación, que consultan un dashboard de solo lectura con el estado del proyecto: información general, objetivos, fases y actividades, cronograma, porcentaje de avance, hitos, indicadores de cumplimiento, actividades finalizadas/en ejecución/pendientes, actividades próximas a vencer y vencidas, línea base y su evolución, y evidencias marcadas como públicas.

2. Colaboradores autenticados (usuario + contraseña + doble factor de autenticación 2FA), creados y administrados por los responsables de la plataforma (no hay autorregistro público), que registran avances de las actividades que tienen asignadas, adjuntan evidencias (enlaces, imágenes, archivos adjuntos, documentos de soporte, observaciones), y cuyas acciones quedan trazadas con usuario y fecha/hora.

El sistema debe mantener una línea base del proyecto que no puede ser modificada directamente por colaboradores; cualquier cambio autorizado debe conservar fecha original, nueva fecha, usuario que hizo el cambio, fecha/hora del cambio, justificación e historial completo.

Debe existir un sistema de notificaciones por correo electrónico (activación de cuenta, recuperación de contraseña, 2FA, alertas de actividades próximas a vencer y vencidas, confirmaciones de registro de avance, notificaciones de cambios importantes), con anticipación configurable (por ejemplo 7, 3 o 1 día antes del vencimiento).

El sistema debe tener auditoría y trazabilidad completa de acciones de usuarios y modificaciones.

El despliegue final será en Hostinger, usando Docker, con PostgreSQL dockerizado. Este documento de requisitos es la base de la que partirán la Fase 1 (arquitectura) y todas las fases posteriores del plan maestro ya aprobado por el usuario (16 fases, desde requisitos hasta documentación de cierre).

Este es el texto original de requerimientos entregado por el usuario, que debes tomar como fuente primaria de verdad y no contradecir ni reinterpretar libremente:

[PEGAR AQUÍ, SIN MODIFICAR, EL TEXTO COMPLETO DE REQUERIMIENTOS ORIGINAL DEL USUARIO QUE DESCRIBE: visualización pública del proyecto, acceso para colaboradores, registro de avances, gestión de evidencias, alertas y notificaciones por correo, control de fechas y línea base, seguridad y trazabilidad, arquitectura tecnológica, y flujo general de funcionamiento.]
</context>

<objective>
Producir un conjunto de documentos de especificación (funcional y no funcional) que consoliden, formalicen y resuelvan toda ambigüedad de los requisitos ya descritos por el usuario, de modo que sirvan como base inequívoca para el diseño de arquitectura en la Fase 1. El objetivo específico de esta fase es eliminar incertidumbre semántica y de reglas de negocio antes de que se tome cualquier decisión técnica.
</objective>

<tasks>
1. Leer y analizar íntegramente el texto de requerimientos original provisto en `<context>`.
2. Elaborar un glosario del dominio con definiciones precisas y no ambiguas de: proyecto, fase, actividad, hito, línea base, avance, evidencia (y sus tipos: enlace, imagen, archivo adjunto, documento de soporte), colaborador, administrador, visitante, notificación/alerta, auditoría.
3. Identificar y documentar los actores del sistema (visitante público, colaborador, administrador, sistema/scheduler de notificaciones) con una descripción de qué puede y qué no puede hacer cada uno, en lenguaje de negocio (sin diseño técnico todavía).
4. Redactar los casos de uso principales en formato "Como [actor], quiero [acción], para [beneficio]", cubriendo como mínimo: consulta pública del dashboard, login con 2FA, gestión de usuarios por administrador, asignación de actividades, registro de avance, carga de evidencias, cambio autorizado de línea base, configuración de reglas de alerta, recepción de notificaciones, consulta de auditoría.
5. Formalizar las reglas de negocio explícitas que hoy están implícitas en el texto original, incluyendo como mínimo:
   - Cómo se calcula el porcentaje de avance de una actividad, de una fase y del proyecto completo (promedio simple, ponderado por duración, ponderado por peso definido manualmente, u otro).
   - Qué determina que una actividad esté "próxima a vencer" versus "vencida" (umbrales por defecto y si son configurables por actividad o solo globales).
   - Si el porcentaje de avance de una actividad puede disminuir o solo puede aumentar.
   - Qué hace que una evidencia sea pública o privada (marcado manual por el colaborador, regla automática, o decisión de un administrador).
   - Si una actividad puede tener más de un colaborador asignado, y cómo se resuelve el avance si hay varios.
   - Qué campos son obligatorios al crear una actividad, un hito y una evidencia.
   - Qué pasa con las evidencias y avances de un colaborador que es desactivado o eliminado (se conservan por trazabilidad, no se eliminan).
   - Cómo se relacionan jerárquicamente proyecto → fases → actividades → hitos (¿un hito pertenece a una fase, a una actividad, o es independiente?).
6. Elaborar la lista de requisitos no funcionales, cubriendo como mínimo: disponibilidad esperada, tiempo de respuesta esperado del dashboard público, número estimado de usuarios concurrentes (público y colaboradores), volumen estimado de actividades y evidencias, tamaño máximo por archivo adjunto y tipos de archivo permitidos, tiempo de retención de evidencias/auditoría, idioma(s) de la interfaz, requisitos de accesibilidad, y cualquier requisito regulatorio o de protección de datos personales aplicable (dado que se manejarán correos electrónicos y datos de usuarios).
7. Elaborar la lista de preguntas abiertas dirigidas al usuario que deben resolverse antes de aprobar esta fase. Como mínimo deben quedar cubiertas: número estimado de colaboradores y de visitantes concurrentes; volumen y tamaño esperado de evidencias; proveedor de correo SMTP a utilizar en producción; dominio o subdominio definitivo en Hostinger; plan de Hostinger contratado (recursos disponibles, soporte de Docker/Docker Compose); idioma de la interfaz; si existen requisitos legales o de protección de datos aplicables (por ejemplo, normativa local sobre datos personales); mecanismo preferido de 2FA (aplicación TOTP tipo Google Authenticator/Authy, o código por correo); política de contraseñas deseada; tiempo de anticipación por defecto para alertas de vencimiento si el usuario no lo especifica.
8. Consolidar todo lo anterior en los documentos indicados en `<deliverables>`, siguiendo el formato ahí especificado.
9. NO avanzar a proponer arquitectura, stack tecnológico, modelo de base de datos técnico ni estructura de API: eso pertenece a la Fase 1 y debe quedar explícitamente fuera de alcance de esta entrega.
</tasks>

<architecture>
No aplica en esta fase. Esta fase es exclusivamente de especificación de requisitos de negocio; no se debe proponer, sugerir ni insinuar arquitectura técnica, stack, ni modelo de datos técnico. Cualquier necesidad de esa naturaleza detectada durante el análisis debe registrarse como pregunta abierta o nota para la Fase 1, no resolverse aquí.
</architecture>

<technologies>
No aplica en esta fase. No se debe mencionar ni recomendar lenguajes de programación, frameworks, bases de datos, ni herramientas de infraestructura. La única "herramienta" de esta fase es el propio Markdown de los documentos entregables.
</technologies>

<files>
Crea los siguientes archivos Markdown dentro de una carpeta `docs/fase-0-requisitos/` en la raíz del repositorio (créala si no existe):

- `docs/fase-0-requisitos/01-glosario.md`
- `docs/fase-0-requisitos/02-actores-y-casos-de-uso.md`
- `docs/fase-0-requisitos/03-reglas-de-negocio.md`
- `docs/fase-0-requisitos/04-requisitos-no-funcionales.md`
- `docs/fase-0-requisitos/05-preguntas-abiertas.md`
- `docs/fase-0-requisitos/00-resumen-ejecutivo.md` (resumen de una página que enlaza y sintetiza los cinco documentos anteriores)

No modifiques ni crees ningún otro archivo del repositorio en esta fase (no hay código todavía).
</files>

<rules>
- No inventes decisiones de negocio que el usuario no ha tomado: si algo no está claro en el texto original, va a `05-preguntas-abiertas.md`, no se asume.
- No propongas tecnología, arquitectura ni modelo de datos técnico en ningún documento de esta fase.
- Usa terminología consistente en todos los documentos (el glosario de `01-glosario.md` es la fuente de verdad de los términos; no introduzcas sinónimos no definidos allí).
- Cada regla de negocio en `03-reglas-de-negocio.md` debe redactarse de forma que sea directamente verificable más adelante mediante una prueba (evita frases vagas como "el sistema debe ser flexible").
- Cada pregunta en `05-preguntas-abiertas.md` debe ser una pregunta cerrada o de opción múltiple siempre que sea posible, para facilitar que el usuario responda rápido.
- Escribe todos los documentos en español, con formato Markdown limpio (encabezados, sin XML dentro de los entregables).
- No cierres esta fase como completa hasta que el usuario apruebe explícitamente el contenido; dejar claro al final del resumen ejecutivo que la fase queda "pendiente de aprobación del usuario".
</rules>

<security>
Aunque esta fase no produce código, debe dejar sentadas las bases de seguridad que las fases siguientes deberán respetar. En `04-requisitos-no-funcionales.md` incluye explícitamente una subsección de seguridad que cubra como mínimo: necesidad de 2FA obligatorio para todo colaborador (sin excepciones), política de manejo de contraseñas (sin definir aún el algoritmo, pero sí el requisito de que nunca se almacenen en texto plano), necesidad de que las evidencias privadas nunca sean accesibles sin autenticación (ni siquiera por URL directa), necesidad de registrar en auditoría cualquier acceso o modificación a datos sensibles, y la pregunta abierta sobre requisitos legales de protección de datos personales aplicables al proyecto.
</security>

<testing>
Esta fase no produce código, por lo que no hay pruebas automatizadas. La validación de esta fase consiste en:
1. Verificación de trazabilidad: cada punto del texto de requerimientos original en `<context>` debe estar reflejado en al menos uno de los documentos entregables (glosario, casos de uso, reglas de negocio o requisitos no funcionales). Si algún punto del texto original no quedó cubierto en ningún documento, es un defecto de esta fase y debe corregirse antes de entregar.
2. Revisión de consistencia interna: los términos usados en `02-actores-y-casos-de-uso.md` y `03-reglas-de-negocio.md` deben coincidir exactamente con las definiciones de `01-glosario.md`.
3. Revisión de que `05-preguntas-abiertas.md` no contenga ninguna pregunta cuya respuesta ya esté disponible en el texto original (evitar preguntar lo que el usuario ya especificó).
</testing>

<acceptance_criteria>
- Los seis documentos existen en `docs/fase-0-requisitos/` con el contenido descrito en `<files>` y `<tasks>`.
- Todo el contenido del texto de requerimientos original está reflejado y trazado en la documentación (ninguna funcionalidad mencionada por el usuario queda fuera).
- El glosario no tiene términos contradictorios ni ambiguos entre documentos.
- Las reglas de negocio en `03-reglas-de-negocio.md` son verificables (formulables como criterios de aceptación de prueba en fases futuras).
- La lista de preguntas abiertas en `05-preguntas-abiertas.md` es completa, concreta y accionable (el usuario puede responderla en una sola sesión).
- Ningún documento de esta fase menciona stack tecnológico, arquitectura ni modelo de datos técnico.
- El usuario ha revisado y aprobado explícitamente el contenido antes de considerar la Fase 0 cerrada.
</acceptance_criteria>

<deliverables>
1. `docs/fase-0-requisitos/00-resumen-ejecutivo.md` — resumen de una página con enlaces a los demás documentos y un listado breve de las preguntas abiertas más críticas.
2. `docs/fase-0-requisitos/01-glosario.md` — glosario completo del dominio.
3. `docs/fase-0-requisitos/02-actores-y-casos-de-uso.md` — actores y casos de uso en formato "Como/quiero/para".
4. `docs/fase-0-requisitos/03-reglas-de-negocio.md` — reglas de negocio explícitas y verificables.
5. `docs/fase-0-requisitos/04-requisitos-no-funcionales.md` — requisitos no funcionales, incluyendo la subsección de seguridad indicada en `<security>`.
6. `docs/fase-0-requisitos/05-preguntas-abiertas.md` — preguntas abiertas pendientes de respuesta del usuario, priorizadas por bloqueo (cuáles impiden empezar la Fase 1 y cuáles no).
7. Un mensaje final de Claude Code resumiendo, en un párrafo, qué quedó documentado y cuáles son las 3-5 preguntas abiertas más urgentes para que el usuario las responda antes de aprobar el paso a la Fase 1.
</deliverables>
```

---

## Antes de usar este prompt

Reemplaza el marcador `[PEGAR AQUÍ...]` dentro de `<context>` con el texto completo de requerimientos que ya me diste (visualización pública, acceso de colaboradores, registro de avances, evidencias, alertas y notificaciones, línea base, seguridad, arquitectura tecnológica y flujo general). Claude Code necesita ese texto íntegro como fuente primaria, no un resumen.

## Después de ejecutar esta fase en Claude Code

1. Revisa los seis documentos generados en `docs/fase-0-requisitos/`.
2. Responde la lista de preguntas abiertas de `05-preguntas-abiertas.md`.
3. Cuando apruebes el contenido, dímelo y preparo el prompt de la Fase 1 (Arquitectura y Diseño Técnico), incorporando tus respuestas a las preguntas abiertas.
