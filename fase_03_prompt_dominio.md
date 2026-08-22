# Prompt para Claude Code — Fase 3: Modelo de Datos y Backend Core del Dominio

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 3 de 16 — Modelo de Datos y Backend Core del Dominio
**Depende de:** Fase 2 completada y validada (andamiaje ejecutable con `docker compose up`, `/api/health` OK). Diseño en `docs/fase-1-arquitectura/`.
**Skills de Claude recomendadas:** `engineering:system-design` (si hay que refinar el modelo) y `engineering:testing-strategy` (para las pruebas de cálculo e inmutabilidad).

> **Nota de secuencia:** ejecuta esta fase sobre la rama de la Fase 2 ya integrada. En esta fase **sí** se escriben pruebas automatizadas (unitarias y de integración): forman parte de la entrega.

Copia y pega el bloque completo de abajo (desde `<role>` hasta `</deliverables>`) directamente en Claude Code.

---

```xml
<role>
Eres un ingeniero backend senior, responsable de la Fase 3 de un proyecto de desarrollo dentro de Claude Code. Tu tarea es implementar el núcleo del dominio en base de datos y backend: proyecto, fases, actividades, hitos, cronograma y línea base con su historial inmutable, más la lógica de cálculo de avance y de estado de actividades. Sigues estrictamente el modelo de datos y las reglas aprobadas en las Fases 0 y 1. Todo cálculo y toda invariante debe quedar cubierto por pruebas. No implementas autenticación, evidencias, notificaciones ni auditoría todavía: eso corresponde a fases posteriores.
</role>

<context>
Fuentes de verdad:
- Requisitos: `docs/fase-0-requisitos/` (reglas RN-01 a RN-18).
- Arquitectura: `docs/fase-1-arquitectura/` — especialmente `02-modelo-datos.md` (entidades), `03-api-preliminar.md` (contratos) y `06-trazabilidad-requisitos.md`.
- Andamiaje: repositorio de la Fase 2 (NestJS en `backend/`, Prisma, PostgreSQL dockerizado, worker, frontend, Caddy).

Stack: NestJS + Prisma + PostgreSQL (ya en marcha). Trabajas dentro de `backend/`.

Reglas de negocio que esta fase debe materializar (de la Fase 0, ya aprobadas):
- Jerarquía Proyecto → Fase → Actividad; el Hito pertenece a una Actividad (RN-01).
- Cálculo de Avance (RN-02): Avance de Fase = promedio simple de sus Actividades; Avance de Proyecto = suma ponderada de las Fases por su peso (los pesos de las Fases suman 100 %). (La ponderación por colaborador dentro de una Actividad y el registro de avances con autoría llegan en la Fase 5; en esta fase el avance de una Actividad puede representarse con un valor único por Actividad.)
- El Avance de una Actividad puede subir y bajar (RN-05) — relevante al registrar avances (Fase 5); aquí la lógica de cálculo no impone monotonía.
- Estados de Actividad (RN-03, RN-04): Pendiente, En ejecución, Finalizada, Próxima a vencer, Vencida; "Próxima a vencer" y "Vencida" dependen de umbrales configurables (PA-08/PA-12, aún abiertos): deben quedar PARAMETRIZADOS, no hardcodeados.
- Línea Base inmutable (RN-07): un cambio autorizado conserva fecha original, nueva fecha, usuario, fecha/hora y justificación, con historial completo; la fecha original nunca se sobrescribe.
- Invariante: la suma de los pesos de las Fases de un Proyecto = 100 % (RN-02).

Restricción importante: la autenticación se implementa en la Fase 4. En esta fase, los endpoints de escritura pueden quedar temporalmente sin protección o detrás de un flag de configuración, dejando MUY explícito con comentarios y en el README que es temporal y que la protección por rol se añade en la Fase 4. No expongas estos endpoints en un despliegue público mientras tanto.
</context>

<objective>
Implementar en PostgreSQL (vía Prisma) y en el backend NestJS las entidades centrales del dominio y su lógica, de modo que se pueda: crear un Proyecto con Fases, Actividades e Hitos; consultar su cronograma; calcular el % de Avance por Actividad, por Fase y del Proyecto según RN-02; derivar el Estado de cada Actividad según umbrales configurables; y registrar cambios de Línea Base con historial inmutable. Todo cubierto por pruebas unitarias (cálculo/estado/inmutabilidad) y de integración (endpoints CRUD).
</objective>

<tasks>
1. Leer `docs/fase-1-arquitectura/02-modelo-datos.md` y `03-api-preliminar.md`; implementar el subconjunto de dominio de esta fase respetándolos. Ante conflicto, prevalecen los documentos (y se reporta).
2. Definir en Prisma las entidades: Proyecto, Fase (con `peso_porcentaje`), Actividad (fechas de línea base vigente, `finalizada`, avance), Hito (asociado a Actividad, `fecha_objetivo`, `cumplido`) y CambioLineaBase (historial inmutable). Generar la migración correspondiente.
3. Reforzar invariantes en base de datos donde aplique: rango de porcentajes (0–100), y validación de que la suma de pesos de las Fases de un Proyecto sea 100 % (por constraint, trigger o validación de dominio bien probada).
4. Implementar módulos NestJS con CRUD para Proyecto, Fase, Actividad e Hito, siguiendo los contratos de `03-api-preliminar.md` (endpoints públicos de consulta y endpoints de escritura, estos últimos marcados como temporalmente sin auth).
5. Implementar la lógica de cálculo de Avance como funciones puras y testeables: Actividad → Fase (promedio simple) → Proyecto (ponderado por peso de Fase). Cubrir con pruebas unitarias, incluyendo casos límite (fase sin actividades, pesos que no suman 100 %, etc.).
6. Implementar la derivación del Estado de una Actividad (Pendiente/En ejecución/Finalizada/Próxima a vencer/Vencida) a partir de fechas, `finalizada` y un umbral de anticipación CONFIGURABLE (parámetro, no constante en código). Cubrir con pruebas usando fechas simuladas (a 7/3/1 días y vencidas).
7. Implementar el endpoint de consulta de Cronograma (Fases/Actividades/Hitos con fechas y estados) y el de Indicadores agregados (% Proyecto, nº de actividades vencidas, hitos cumplidos).
8. Implementar el cambio autorizado de Línea Base: endpoint que actualiza la fecha vigente de una Actividad/Hito y crea un registro en CambioLineaBase conservando la fecha original; garantizar que la fecha original nunca se sobrescribe y que un Colaborador no podrá hacerlo (la verificación de rol se completa en la Fase 4; deja el punto de extensión listo).
9. Escribir pruebas: unitarias (cálculo de avance, derivación de estado, inmutabilidad de línea base) y de integración (CRUD de las entidades vía la API). Incluir una prueba específica de que la línea base es inmutable salvo por el flujo de cambio con historial.
10. Actualizar el README con los nuevos endpoints, cómo correr las migraciones y las pruebas, y la advertencia de que los endpoints de escritura están temporalmente sin autenticación hasta la Fase 4.
11. NO implementar autenticación/2FA, evidencias, notificaciones ni auditoría (fases 4, 6, 7, 8). NO implementar aún el registro de avances con autoría ni la multiasignación con pesos por colaborador (Fase 5); deja el modelo preparado para extenderlo sin rehacerlo.
</tasks>

<architecture>
Respeta el modelo de `docs/fase-1-arquitectura/02-modelo-datos.md`. Implementa solo el subconjunto de dominio de esta fase (Proyecto, Fase, Actividad, Hito, CambioLineaBase); deja las demás entidades (Usuario, Asignación, Avance con autoría, Evidencia, Notificación, Auditoría) para sus fases, pero sin introducir decisiones que las contradigan. El Estado de la Actividad se calcula en tiempo de consulta (no se almacena), según lo definido en la Fase 1.
</architecture>

<technologies>
Usa el stack ya establecido: NestJS, Prisma, PostgreSQL, TypeScript. Framework de pruebas el que traiga NestJS por defecto (Jest). No introduzcas nuevas dependencias de infraestructura (Redis, colas, S3): siguen siendo evolución futura.
</technologies>

<files>
Trabaja principalmente dentro de `backend/`:
- `backend/prisma/schema.prisma` — ampliar con las entidades de dominio de esta fase; nueva migración en `backend/prisma/migrations/`.
- `backend/src/` — módulos de dominio (p. ej. `proyecto/`, `fase/`, `actividad/`, `hito/`, `linea-base/`, `cronograma/`), con sus controladores, servicios y DTOs.
- Lógica de cálculo en funciones/servicios puros y testeables (p. ej. `backend/src/dominio/calculo-avance.ts`, `backend/src/dominio/estado-actividad.ts`).
- Pruebas junto al código o en `backend/test/`, según la convención de NestJS.
- Actualiza el `README.md` de la raíz con los nuevos endpoints, migraciones y pruebas.

No modifiques los documentos de las Fases 0 y 1. No toques frontend/worker salvo que sea imprescindible (y justifícalo).
</files>

<rules>
- Los documentos de las Fases 0 y 1 son la fuente de verdad; no los contradigas.
- Umbrales de vencimiento (RN-03) PARAMETRIZADOS, nunca hardcodeados; con un valor por defecto documentado y sobreescribible.
- La fecha original de la Línea Base NUNCA se sobrescribe; todo cambio queda en el historial (RN-07).
- El cálculo de Avance debe seguir exactamente RN-02 (promedio simple por Fase; ponderado por peso de Fase para el Proyecto).
- Los endpoints de escritura sin auth de esta fase deben estar marcados como temporales (comentarios + README) y no desplegarse públicamente hasta la Fase 4.
- Toda regla de cálculo/estado/inmutabilidad va acompañada de prueba.
- Código en TypeScript idiomático; nombres de dominio en español coherentes con el glosario.
</rules>

<security>
- No introduzcas endpoints que expongan datos que la Fase 0 marcó como no públicos.
- Deja preparados los puntos de extensión para la autorización por rol de la Fase 4 (p. ej. el cambio de Línea Base solo por Administrador): estructura el código para que añadir el guard sea trivial, sin reescribir la lógica.
- Valida entradas (rangos de porcentaje, fechas coherentes, pesos) para evitar estados inválidos en la base de datos.
- No registres datos sensibles en logs.
</security>

<testing>
Esta fase incluye pruebas automatizadas como parte de la entrega:
1. Unitarias de cálculo de Avance: Actividad→Fase (promedio simple) y Fase→Proyecto (ponderado por peso), con casos límite (fase vacía, pesos incompletos, 0 % y 100 %).
2. Unitarias de derivación de Estado: con fechas simuladas a 7/3/1 días del vencimiento y ya vencidas, verificando la clasificación correcta según el umbral configurado; y que "Finalizada" excluye "Próxima a vencer"/"Vencida" (RN-04).
3. Unitarias/integración de inmutabilidad de Línea Base: un cambio autorizado conserva la fecha original y crea historial; no existe vía para sobrescribir la fecha original.
4. Integración de los endpoints CRUD (crear un proyecto completo con fases, actividades e hitos y consultar cronograma y % de avance calculado correctamente).
Las pruebas deben poder ejecutarse en el entorno dockerizado o con una base de datos de pruebas; documenta el comando.
</testing>

<acceptance_criteria>
- Se puede crear, vía API, un Proyecto con Fases, Actividades e Hitos, y consultar su cronograma.
- El % de Avance de Actividad, Fase y Proyecto se calcula correctamente según RN-02 (verificado por pruebas).
- El Estado de cada Actividad se deriva correctamente según umbrales configurables (verificado con fechas simuladas).
- Un cambio de Línea Base queda registrado con historial completo (fecha original, nueva, usuario, fecha/hora, justificación) y no sobrescribe la fecha original (verificado por prueba).
- La suma de pesos de las Fases de un Proyecto se valida (no se admiten configuraciones que no sumen 100 %).
- Las pruebas unitarias y de integración pasan.
- No se ha implementado autenticación, evidencias, notificaciones ni auditoría; los endpoints de escritura sin auth están claramente marcados como temporales.
- README actualizado con endpoints, migraciones y pruebas.
</acceptance_criteria>

<deliverables>
1. Esquema Prisma ampliado y migración aplicable de las entidades de dominio de esta fase.
2. Módulos NestJS (CRUD + consultas) para Proyecto, Fase, Actividad, Hito, Cronograma e Indicadores.
3. Lógica de cálculo de Avance y derivación de Estado como funciones/servicios puros y testeables.
4. Flujo de cambio de Línea Base con historial inmutable.
5. Suite de pruebas unitarias y de integración descrita en `<testing>`.
6. README actualizado.
7. Un mensaje final de Claude Code que resuma: qué entidades y endpoints se implementaron, evidencia de las pruebas de cálculo/estado/inmutabilidad pasando, y qué queda explícitamente para las fases 4 y 5 (autenticación y registro de avances con autoría/pesos por colaborador).
</deliverables>
```

---

## Antes de usar este prompt

Ejecuta esta fase **después de validar la Fase 2** (que el stack levante y `/api/health` responda). Recuerda: los umbrales de "próxima a vencer/vencida" (PA-08/PA-12) siguen abiertos; el prompt pide dejarlos parametrizados con un valor por defecto, así que puedes cerrarlos más tarde sin rehacer código. Si ya decidiste esos umbrales o los campos obligatorios de actividad/hito (PA-15), indícalo antes de ejecutar.

## Después de ejecutar esta fase en Claude Code

1. Corre las migraciones y las pruebas; verifica el cálculo de avance y la inmutabilidad de la línea base.
2. Cuando valides el dominio, dímelo y preparo el prompt de la **Fase 4 — Autenticación, Usuarios, Roles y 2FA**.
