# 03 — Reglas de Negocio

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** Borrador — pendiente de aprobación del usuario

Los términos empleados están definidos en `01-glosario.md`. Cada regla se redacta de forma **verificable**: puede transformarse en un criterio de aceptación de prueba en fases posteriores.

**Convención de estado de cada regla:**
- ✅ **Confirmada** — se deriva directamente del texto de requerimientos original; es una decisión ya tomada por el usuario.
- ⛔ **Por confirmar** — el texto original no la fija. Aquí se enuncia el *hueco de decisión* y las opciones mutuamente excluyentes, **sin asumir** ninguna. Su definición depende de la pregunta abierta indicada (`05-preguntas-abiertas.md`). No se implementará hasta que el usuario elija.

---

## Estructura y jerarquía

### RN-01 — Jerarquía del Proyecto ✅ Confirmada (PA-11)
El árbol de datos es **Proyecto → Fases → Actividades**, y un **Hito pertenece a una Actividad**. La Fase se compone de la suma de sus Actividades.
- **Verificable:** crear un Hito exige asociarlo a una Actividad existente; el sistema rechaza un Hito sin Actividad. Cada Actividad pertenece a exactamente una Fase.

---

## Cálculo de avance

### RN-02 — Cálculo del porcentaje de Avance (Actividad, Fase, Proyecto) ✅ Confirmada (PA-09, PA-14)
Modelo de agregación en tres niveles:
- **Nivel Actividad, un solo Colaborador:** el Avance de la Actividad es el porcentaje (0–100) de su último Avance registrado.
- **Nivel Actividad, varios Colaboradores (ver RN-08):** el Avance de la Actividad es la suma ponderada `Σ (peso_i × avance_i)`, donde `peso_i` es el porcentaje de trabajo asignado al Colaborador *i* en esa Actividad (con `Σ peso_i = 100 %`) y `avance_i` es el último Avance registrado por ese Colaborador.
- **Nivel Fase:** **promedio simple** de las Actividades que componen la Fase. El número de Actividades por Fase no altera la fórmula.
- **Nivel Proyecto:** **suma ponderada de las Fases por su peso**: `avance_Proyecto = Σ (peso_fase × avance_fase)`. Cada Fase tiene asignado un **peso** que representa el porcentaje que aporta al Proyecto, y la **suma de los pesos de todas las Fases debe ser 100 %**.
- **Verificable:** (a) el Avance de una Fase coincide con el promedio simple de sus Actividades; (b) el Avance del Proyecto coincide con la suma ponderada de las Fases por su peso; (c) el sistema rechaza una configuración de pesos de Fase cuya suma ≠ 100 %.

> Pendiente menor para Fase 1 (no bloqueante): quién asigna/edita el peso de cada Fase (se asume el Administrador). Confirmar en revisión.

### RN-05 — Monotonía del Avance de una Actividad ✅ Confirmada (PA-10)
El porcentaje de Avance de una Actividad **puede aumentar o disminuir** entre registros sucesivos. Toda variación (al alza o a la baja) queda en el histórico de Avances con autor y fecha/hora; no se sobrescribe.
- **Verificable:** registrar un Avance con porcentaje menor al último se acepta y crea una nueva entrada en el histórico; el histórico conserva todas las variaciones con su autor y fecha/hora.

---

## Estados y vencimientos

### RN-03 — Umbrales de "Próxima a vencer" y "Vencida" ⛔ Por confirmar
- Una Actividad está **Vencida** cuando no está Finalizada y su fecha de fin planificada (de la Línea Base) es anterior a la fecha actual. *(Esta condición es verificable y no ambigua.)*
- Una Actividad está **Próxima a vencer** cuando no está Finalizada y su fecha de fin planificada está dentro de un umbral de anticipación configurable respecto a la fecha actual. Falta definir: (i) el/los valores por defecto del umbral, y (ii) si el umbral es solo **global** o también **configurable por Actividad**.
- **Verificable cuando se confirme:** con fechas simuladas a 7, 3 y 1 día del vencimiento y ya vencidas, el sistema clasifica cada Actividad en el Estado correcto según el umbral configurado.
- **Depende de:** PA-08, PA-12.

### RN-04 — Estados excluyentes de una Actividad ✅ Confirmada
Una Actividad tiene, en todo momento, exactamente uno de los Estados definidos en `01-glosario.md` (Pendiente, En ejecución, Finalizada, Próxima a vencer, Vencida).
- **Verificable:** para cualquier Actividad y fecha de evaluación, el sistema devuelve uno y solo un Estado; "Próxima a vencer" y "Vencida" nunca se aplican a una Actividad Finalizada.

---

## Evidencias

### RN-06 — Visibilidad de las Evidencias: contenido siempre privado ✅ Confirmada (PA-13)
El Dashboard Público muestra **toda la información del Proyecto** (información general, objetivos, Fases, Actividades, Cronograma, Avance, Hitos, Indicadores, estados y Línea Base con su evolución). Lo único que **no** expone públicamente es el **contenido o enlace de las Evidencias**: el acceso al archivo, la imagen, el documento o la URL de una Evidencia requiere estar autenticado. No existe el concepto de Evidencia Pública.
- **Verificable:** (a) el Dashboard Público carga toda la información del Proyecto sin autenticación; (b) cualquier petición no autenticada al contenido de una Evidencia —incluida la URL directa de un Enlace o archivo— es rechazada; (c) solo un Usuario autenticado obtiene el contenido/enlace de las Evidencias.

> **Cambio respecto al texto original:** el requerimiento inicial contemplaba mostrar "evidencias marcadas como públicas". Por decisión del usuario en Fase 0, el contenido de toda Evidencia queda restringido a Usuarios autenticados.

### RN-13 — Aislamiento estricto del contenido de Evidencias ✅ Confirmada
El contenido o enlace de cualquier Evidencia (archivo, imagen, documento o URL) no es accesible sin autenticación, **ni siquiera mediante acceso directo a su URL**. El Dashboard Público consume la información del Proyecto pero nunca el contenido/enlace de las Evidencias.
- **Verificable:** una petición no autenticada a la URL directa del contenido de una Evidencia es rechazada (no se entrega); ninguna respuesta consumida por el Dashboard Público contiene el contenido/enlace de Evidencias.

### RN-14 — Conservación de datos ante desactivación/eliminación de un Usuario ✅ Confirmada
Cuando un Usuario (Colaborador o Administrador) es desactivado o eliminado, sus Avances y Evidencias **se conservan** por trazabilidad; no se borran.
- **Verificable:** tras desactivar/eliminar un Usuario, los Avances y Evidencias que registró siguen existiendo y siguen atribuidos a él en el histórico y en la Auditoría.

---

## Asignación y campos obligatorios

### RN-08 — Multiasignación de una Actividad ✅ Confirmada (PA-14)
Una Actividad **puede tener uno o varios Colaboradores** asignados. A cada Colaborador asignado se le asigna un **peso** (porcentaje de trabajo) dentro de la Actividad, y la suma de los pesos de una Actividad debe ser 100 %. El Avance de la Actividad se calcula como la suma ponderada de los Avances individuales por su peso (ver RN-02).
- **Verificable:** el sistema permite asignar varios Colaboradores con sus pesos; rechaza una configuración cuya suma de pesos ≠ 100 %; y el Avance de la Actividad coincide con `Σ (peso_i × avance_i)`.

> Pendiente menor para Fase 1 (no bloqueante): quién define/edita los pesos (se asume el Administrador al asignar) y si un Colaborador solo puede editar su propio Avance dentro de la Actividad (coherente con RN-10). Confirmar en revisión.

### RN-09 — Campos obligatorios al crear Actividad, Hito y Evidencia ⛔ Por confirmar
El texto original no enumera los campos obligatorios. Se propone la siguiente base **para confirmación** (no se implementa hasta aprobarse):
- **Actividad:** nombre, Fase a la que pertenece, fecha de fin planificada. *(inicio, descripción y asignados por confirmar).*
- **Hito:** nombre, fecha objetivo *(y su vínculo jerárquico según RN-01).*
- **Evidencia:** tipo, contenido (URL para Enlace / archivo para los demás), visibilidad, autor y fecha (automáticos).
- **Verificable cuando se confirme:** la creación falla con error explícito si falta cualquier campo obligatorio de la lista aprobada.
- **Depende de:** PA-15.

### RN-10 — Autorización de edición de Avances ✅ Confirmada
Un Colaborador solo puede registrar Avances sobre Actividades que tiene asignadas. Un Administrador puede consultar (y según política, gestionar) el histórico de cualquier Actividad. El histórico de Avances no se sobrescribe.
- **Verificable:** un Colaborador que intenta registrar un Avance en una Actividad no asignada recibe un rechazo por falta de permiso; un nuevo Avance añade una entrada al histórico sin borrar las anteriores.

---

## Línea Base

### RN-07 — Inmutabilidad de la Línea Base y registro de cambios ✅ Confirmada
La Línea Base no puede ser modificada directamente por un Colaborador. Todo cambio autorizado (por un Administrador) conserva: **fecha original, nueva fecha, Usuario que hizo el cambio, fecha/hora del cambio, justificación e historial completo** de cambios previos. La fecha original nunca se sobrescribe.
- **Verificable:** un Colaborador no puede alterar la Línea Base; tras un cambio autorizado se puede consultar la fecha original y todas las versiones anteriores, junto con autor, fecha/hora y justificación de cada cambio.

---

## Notificaciones y alertas

### RN-11 — No duplicación de Alertas ✅ Confirmada
Cada Alerta de vencimiento se emite **exactamente una vez por umbral configurado** para una misma Actividad.
- **Verificable:** una Actividad con umbrales a 7/3/1 día genera como máximo una Alerta por cada umbral; reejecutar la evaluación el mismo día no reenvía la misma Alerta.

### RN-12 — Definición de "cambio importante" notificable ⛔ Por confirmar
El texto original exige notificar "cambios importantes", pero no enumera qué eventos lo son.
- **Verificable cuando se confirme:** cada evento incluido en la lista aprobada de "cambios importantes" genera la Notificación correspondiente; los eventos fuera de la lista no la generan.
- **Opciones típicas a incluir/excluir:** cambio de Línea Base, reasignación de Actividad, cambio de Estado a Vencida, nuevo Avance en una Actividad seguida, etc.
- **Depende de:** PA-16.

### RN-03b — Anticipación por defecto de Alertas ⛔ Por confirmar
Si el Administrador no configura una anticipación, ¿cuál se aplica por defecto? El texto original menciona 7, 3 y 1 día como *ejemplo*, no como valor fijado.
- **Verificable cuando se confirme:** sin configuración explícita, el sistema emite Alertas con la anticipación por defecto aprobada.
- **Depende de:** PA-08.

---

## Seguridad y auditoría (reglas de negocio; el detalle no funcional está en `04`)

### RN-15 — 2FA obligatorio ✅ Confirmada
Todo Colaborador y todo Administrador debe autenticarse con usuario + contraseña + segundo factor (2FA), sin excepciones. Un acceso sin 2FA válido es rechazado.
- **Verificable:** ningún Usuario alcanza funciones autenticadas sin superar el segundo factor.

### RN-16 — Contraseñas nunca en texto plano ✅ Confirmada
Las contraseñas de los Usuarios nunca se almacenan ni se registran (logs/Auditoría) en texto plano.
- **Verificable:** ninguna consulta a los datos almacenados ni a los registros expone una contraseña legible.

### RN-17 — Registro en Auditoría de acceso/modificación a datos sensibles ✅ Confirmada
Toda acción de creación, modificación o eliminación, y todo acceso a datos sensibles, genera un registro de Auditoría con Usuario, fecha/hora, tipo de acción y entidad afectada.
- **Verificable:** ejecutar cada acción crítica produce el registro de Auditoría correspondiente, atribuible al Usuario que la realizó.

### RN-18 — Inmutabilidad de la Auditoría ✅ Confirmada
Los registros de Auditoría no pueden ser alterados ni eliminados desde la aplicación por ningún rol; solo son consultables.
- **Verificable:** no existe operación de la aplicación que modifique o borre un registro de Auditoría; los intentos son rechazados.

---

## Estado de las reglas

**Resueltas por el usuario:** RN-01 (PA-11), RN-02 (PA-09/PA-14), RN-05 (PA-10), RN-06 (PA-13), RN-08 (PA-14).

**Aún por confirmar** (no bloquean el diseño lógico central, pero deben cerrarse antes de implementar su módulo):

| Regla | Tema | Pregunta abierta |
|------|------|------------------|
| RN-03 / RN-03b | Umbrales y anticipación de vencimiento | PA-08, PA-12 |
| RN-09 | Campos obligatorios | PA-15 |
| RN-12 | Qué es un "cambio importante" | PA-16 |
