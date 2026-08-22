# 01 — Glosario del Dominio

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** Borrador — pendiente de aprobación del usuario

Este glosario es la **fuente única de verdad terminológica** de la Fase 0. Todos los demás documentos (`02-actores-y-casos-de-uso.md`, `03-reglas-de-negocio.md`, `04-requisitos-no-funcionales.md`, `05-preguntas-abiertas.md`) deben usar estos términos con exactamente el significado aquí definido. No se admiten sinónimos no listados en este documento.

> **Nota de dominio:** El proyecto real que la plataforma monitoreará es el **Plan de Acción Climática (PAC) de Medellín**, estructurado (según la documentación base entregada) en 6 componentes estratégicos y 18 entregables. Los ejemplos de este glosario se apoyan en esa documentación para ilustrar los términos, pero **no fijan** reglas de negocio: esas se formalizan en `03-reglas-de-negocio.md` o se elevan a `05-preguntas-abiertas.md`.

---

## Términos estructurales del proyecto

### Proyecto
Iniciativa única que la plataforma monitorea de principio a fin. La plataforma gestiona **un solo proyecto** (no es multi-proyecto). En el caso real corresponde al PAC de Medellín. Un Proyecto agrupa: información general, objetivos, un conjunto de Fases, un Cronograma, una Línea Base, un porcentaje de Avance agregado, Hitos e Indicadores de cumplimiento.

### Fase
Agrupación de nivel superior dentro del Proyecto que reúne un conjunto de Actividades con un propósito común. En la documentación base del PAC las Fases se corresponden con los **componentes estratégicos** (p. ej. "Evidencia, diagnóstico y prospectiva climática"). Una Fase tiene un porcentaje de Avance derivado de sus Actividades.

> Ambigüedad detectada: no está definido si "Fase" y "componente/eje estratégico" son el mismo nivel jerárquico o dos niveles distintos. Ver pregunta abierta correspondiente en `05-preguntas-abiertas.md`.

### Actividad
Unidad de trabajo concreta y verificable que pertenece a una Fase, tiene fechas planificadas (inicio y/o fin), un porcentaje de Avance, un Estado, y puede tener uno o más Colaboradores asignados. En la documentación base del PAC se corresponde con los **entregables** (P1…P18). Sobre las Actividades se registran los Avances y se adjuntan las Evidencias.

### Hito
Punto de control significativo del Proyecto asociado a una fecha objetivo, que marca la consecución de un resultado relevante (p. ej. "fecha de entrega oficial de un entregable"). Un Hito **no acumula porcentaje de Avance propio**: se considera cumplido o no cumplido respecto a su fecha objetivo.

> **Decisión del usuario (PA-11):** un Hito **pertenece a una Actividad**. La suma de las Actividades conforma la Fase.

### Cronograma
Representación temporal ordenada de las Fases, Actividades e Hitos del Proyecto, con sus fechas planificadas y su estado de ejecución. Es lo que el Dashboard Público muestra como línea de tiempo.

---

## Términos de seguimiento y control

### Línea Base
Conjunto de fechas y valores planificados **oficiales** del Proyecto (fechas de inicio/fin de Actividades, fechas objetivo de Hitos) que sirve como referencia inmutable contra la cual se compara la ejecución real. La Línea Base **no puede ser modificada directamente por un Colaborador**. Cualquier cambio autorizado sobre ella conserva: fecha original, nueva fecha, Usuario que realizó el cambio, fecha/hora del cambio, justificación e historial completo de cambios anteriores.

### Evolución de la Línea Base
Historial ordenado de los cambios autorizados aplicados a la Línea Base, que permite ver cómo variaron las fechas planificadas a lo largo del tiempo. Es información que el Dashboard Público puede mostrar ("línea base y su evolución").

### Avance
Registro del progreso de una Actividad en un momento dado, expresado como un porcentaje (0 %–100 %) y acompañado opcionalmente de Observaciones y de Evidencias. Cada Avance queda trazado con el Colaborador autor y la fecha/hora del registro. El histórico de Avances de una Actividad no se sobrescribe.

> **Decisiones del usuario:** el porcentaje de Avance de una Actividad **puede subir y bajar** (PA-10); todo cambio queda en el histórico. El Avance de una Fase es el **promedio simple** de sus Actividades (independiente de cuántas tenga), y el Avance del Proyecto es la **suma ponderada de las Fases por su peso**, donde cada Fase aporta un porcentaje al Proyecto y la suma de esos pesos es 100 % (PA-09). Cuando una Actividad tiene varios Colaboradores, su Avance se **pondera por el porcentaje de trabajo (peso)** de cada Colaborador (PA-14). Ver `03-reglas-de-negocio.md`.

### Estado de una Actividad
Clasificación del momento de ejecución de una Actividad. Los estados reconocidos en esta fase son:
- **Pendiente:** aún no iniciada.
- **En ejecución:** iniciada y no finalizada.
- **Finalizada:** completada (Avance = 100 % o marcada como terminada).
- **Próxima a vencer:** no finalizada y con fecha de fin planificada dentro del umbral de anticipación configurado.
- **Vencida:** no finalizada y con fecha de fin planificada ya superada.

> Ambigüedad detectada: "Próxima a vencer" y "Vencida" son estados derivados de umbrales configurables cuyos valores por defecto no están fijados por el usuario. Ver `03-reglas-de-negocio.md` y `05-preguntas-abiertas.md`.

### Indicador de cumplimiento
Métrica derivada y de solo lectura que resume el desempeño del Proyecto, una Fase o una Actividad (p. ej. % de Avance, número de Actividades vencidas, número de Hitos cumplidos a tiempo). Los Indicadores se calculan a partir de los datos registrados; no se editan manualmente.

---

## Términos de evidencia

### Evidencia
Elemento de soporte que un Colaborador asocia a una Actividad (o a un Avance) para respaldar el progreso reportado. Toda Evidencia tiene metadatos de trazabilidad (autor, fecha/hora de carga) y una marca de **visibilidad** (Pública o Privada). Tipos de Evidencia reconocidos:

- **Enlace:** referencia a un recurso externo mediante una URL.
- **Imagen:** archivo de imagen cargado a la plataforma (p. ej. fotografía de campo, captura).
- **Archivo adjunto:** archivo genérico cargado a la plataforma.
- **Documento de soporte:** archivo cargado que constituye un documento formal de respaldo (p. ej. informe, acta).
- **Observación:** texto libre que acompaña o complementa a las Evidencias anteriores.

> Nota: "Archivo adjunto" y "Documento de soporte" se distinguen por intención (adjunto genérico vs. documento formal), no necesariamente por formato técnico. Si el usuario no requiere distinguirlos, pueden unificarse; ver `05-preguntas-abiertas.md`.

### Evidencia Privada
**Decisión del usuario (PA-13): el contenido de toda Evidencia es privado.** El Dashboard Público muestra toda la información del Proyecto (información general, objetivos, Fases, Actividades, Cronograma, Avance, Hitos, Indicadores, estados y Línea Base con su evolución), pero el **contenido o enlace de una Evidencia** (archivo, imagen, documento o URL) solo es accesible para Usuarios autenticados con permiso, y **nunca** sin autenticación, ni siquiera mediante acceso directo a su URL. No existe el concepto de Evidencia Pública.

> **Cambio respecto al texto original:** el requerimiento inicial contemplaba "evidencias marcadas como públicas". Por decisión del usuario en esta fase, el contenido de toda Evidencia queda restringido a Usuarios autenticados; el resto de la información del Proyecto sí es pública.

---

## Términos de personas y acceso

### Usuario
Cualquier persona con una cuenta en la plataforma que puede autenticarse. Es un término paraguas que incluye a Colaboradores y Administradores. Las cuentas son creadas por los responsables de la plataforma; **no existe autorregistro público**.

### Colaborador
Usuario autenticado que registra Avances sobre las Actividades que tiene asignadas y adjunta Evidencias. Se autentica con usuario + contraseña + segundo factor (2FA). No puede modificar la Línea Base directamente ni gestionar otras cuentas de Usuario.

### Administrador
Usuario con privilegios de gestión sobre la plataforma: crea y administra cuentas de Usuario, asigna Actividades a Colaboradores, autoriza cambios de Línea Base, configura las reglas de Alerta y consulta la Auditoría. Se autentica igualmente con usuario + contraseña + 2FA.

> Nota: el texto original habla de "responsables de la plataforma" como quienes crean y administran cuentas; en este glosario ese rol se denomina **Administrador**. Si existieran varios niveles de administración (p. ej. superadministrador), no están especificados; ver `05-preguntas-abiertas.md`.

### Visitante
Persona que consulta el Dashboard Público sin autenticarse. Tiene acceso de lectura a toda la información del Proyecto (objetivos, Fases, Actividades, Cronograma, Avance, Hitos, Indicadores, estados de Actividades, Línea Base), pero **no** al contenido ni a los enlaces de las Evidencias. No registra ni modifica nada.

### Sistema de Notificaciones (Scheduler)
Actor no humano: proceso automático del sistema que evalúa periódicamente el Cronograma y las reglas configuradas para generar y enviar Notificaciones (p. ej. Alertas de vencimiento) sin intervención de un Usuario.

---

## Términos de comunicación y trazabilidad

### Notificación
Mensaje enviado por la plataforma a un Usuario, por correo electrónico, ante un evento del sistema. Incluye, entre otros: activación de cuenta, recuperación de contraseña, entrega de segundo factor (cuando aplique), confirmación de registro de Avance y notificación de cambios importantes.

### Alerta
Tipo específico de Notificación relacionada con el vencimiento de Actividades: **Alerta de próxima a vencer** y **Alerta de vencida**. Las Alertas de próxima a vencer se emiten con una anticipación configurable (p. ej. 7, 3 o 1 día antes de la fecha de fin planificada).

### Regla de Alerta
Configuración, administrada por un Administrador, que determina con cuánta anticipación y bajo qué condiciones se generan las Alertas de vencimiento.

### Auditoría
Registro cronológico, atribuible e inmutable de las acciones relevantes ocurridas en la plataforma (creación, modificación, eliminación, accesos a datos sensibles), con al menos: Usuario responsable, fecha/hora, tipo de acción y entidad afectada. La Auditoría es consultable por el Administrador y no puede ser alterada ni eliminada desde la aplicación.

### Trazabilidad
Propiedad del sistema por la cual toda acción de un Usuario y toda modificación de datos queda vinculada de forma inequívoca a quién la hizo y cuándo. La Trazabilidad se materializa en la Auditoría y en los metadatos de autor/fecha de Avances, Evidencias y cambios de Línea Base.

---

## Restricciones dadas por el usuario (registradas para trazabilidad, no decididas en Fase 0)

Estas afirmaciones provienen del texto de requerimientos original y se registran aquí como **hechos dados por el usuario**, no como decisiones tomadas en esta fase. Las decisiones técnicas derivadas corresponden a la Fase 1.

- El entorno de despliegue objetivo indicado por el usuario es **Hostinger**, con contenedores **Docker** y base de datos **PostgreSQL**. En Fase 0 no se toma ninguna decisión de arquitectura sobre esto; solo se registra como restricción de contexto. Los detalles pendientes (plan contratado, dominio) se elevan en `05-preguntas-abiertas.md`.
