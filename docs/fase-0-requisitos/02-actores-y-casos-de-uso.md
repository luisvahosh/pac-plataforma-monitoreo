# 02 — Actores y Casos de Uso

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** Borrador — pendiente de aprobación del usuario

Los términos usados en este documento (Proyecto, Fase, Actividad, Hito, Línea Base, Avance, Evidencia, Colaborador, Administrador, Visitante, Sistema de Notificaciones, Notificación, Alerta, Auditoría) están definidos en `01-glosario.md` y se usan aquí con ese significado exacto.

---

## 1. Actores del sistema

### 1.1 Visitante (público, sin autenticación)

**Puede:**
- Consultar el Dashboard Público de solo lectura con **toda** la información del Proyecto: información general, objetivos, Fases y Actividades, Cronograma, porcentaje de Avance, Hitos, Indicadores de cumplimiento.
- Ver el estado de las Actividades: Finalizadas, En ejecución, Pendientes, Próximas a vencer y Vencidas.
- Ver la Línea Base y su evolución.

**No puede:**
- Autenticarse mediante autorregistro (no existe registro público).
- Registrar Avances ni cargar Evidencias.
- Ver el **contenido o el enlace de las Evidencias** (archivos, imágenes, documentos o URLs): eso requiere estar autenticado (PA-13), ni siquiera por acceso directo a una URL.
- Modificar cualquier dato del Proyecto.
- Consultar la Auditoría.

### 1.2 Colaborador (autenticado con usuario + contraseña + 2FA)

**Puede:**
- Iniciar sesión con usuario, contraseña y segundo factor (2FA).
- Ver las Actividades que tiene **asignadas**.
- Registrar Avances sobre sus Actividades asignadas (porcentaje, Estado, Observaciones).
- Adjuntar Evidencias (Enlace, Imagen, Archivo adjunto, Documento de soporte, Observación) a sus Avances/Actividades.
- Recuperar su contraseña y gestionar su propio 2FA.
- Recibir Notificaciones y Alertas por correo relativas a sus Actividades.

**No puede:**
- Modificar la Línea Base directamente.
- Crear, editar o desactivar cuentas de Usuario.
- Asignar Actividades (a sí mismo o a otros).
- Registrar Avances sobre Actividades que no tiene asignadas.
- Consultar la Auditoría global de la plataforma.
- Configurar las Reglas de Alerta.

### 1.3 Administrador (autenticado con usuario + contraseña + 2FA)

**Puede:**
- Todo lo que puede un Colaborador, más:
- Crear, activar, editar, desactivar y (según política) eliminar cuentas de Usuario.
- Asignar Actividades a uno o varios Colaboradores.
- Autorizar cambios de Línea Base, registrando justificación e historial.
- Configurar las Reglas de Alerta (anticipación de vencimientos, condiciones de envío).
- Consultar la Auditoría completa (filtrable por Usuario, entidad, rango de fechas y tipo de acción).

**No puede:**
- Modificar el histórico de Avances ya registrados de forma que se pierda la trazabilidad.
- Alterar o eliminar registros de Auditoría desde la aplicación.
- Sobrescribir la fecha original de la Línea Base al autorizar un cambio (debe conservarse).

### 1.4 Sistema de Notificaciones (Scheduler — actor no humano)

**Puede:**
- Evaluar periódicamente el Cronograma y las Reglas de Alerta.
- Generar y enviar Notificaciones y Alertas por correo (activación de cuenta, recuperación de contraseña, entrega de 2FA cuando aplique, próximas a vencer, vencidas, confirmación de registro de Avance, cambios importantes).
- Registrar las Notificaciones enviadas para evitar duplicados y para Auditoría.

**No puede:**
- Modificar datos del Proyecto (Avances, Evidencias, Línea Base).
- Enviar Notificaciones fuera de las Reglas de Alerta configuradas.

---

## 2. Casos de uso principales

Formato: **Como** [actor], **quiero** [acción], **para** [beneficio]. Cada caso de uso incluye notas de alcance y remite a las reglas de negocio verificables aplicables en `03-reglas-de-negocio.md`.

### CU-01 — Consulta pública del Dashboard
**Como** Visitante, **quiero** consultar el estado completo del Proyecto sin autenticarme, **para** conocer objetivos, Cronograma, avance, Hitos, Indicadores y Línea Base.
- Alcance: solo lectura de toda la información del Proyecto. **No** incluye el contenido/enlace de las Evidencias, que requiere autenticación (PA-13).
- Reglas aplicables: RN-13 (aislamiento de datos privados), RN-02/03/04 (cálculo y estados mostrados).

### CU-02 — Inicio de sesión con 2FA
**Como** Colaborador o Administrador, **quiero** iniciar sesión con usuario, contraseña y segundo factor, **para** acceder de forma segura a mis funciones.
- Alcance: autenticación de dos factores obligatoria; sin 2FA válido no hay acceso.
- Reglas aplicables: RN-15 (2FA obligatorio), RN-16 (contraseñas nunca en texto plano).

### CU-03 — Gestión de Usuarios por el Administrador
**Como** Administrador, **quiero** crear, activar, editar y desactivar cuentas de Colaborador y Administrador, **para** controlar quién accede a la plataforma sin permitir autorregistro público.
- Alcance: alta por Administrador; envío de correo de activación; sin autorregistro.
- Reglas aplicables: RN-14 (conservación de datos de Usuarios desactivados/eliminados), RN-15.

### CU-04 — Asignación de Actividades
**Como** Administrador, **quiero** asignar Actividades a uno o varios Colaboradores, **para** que cada quien registre el Avance de lo que le corresponde.
- Alcance: una Actividad puede tener uno o varios Colaboradores (por confirmar en RN-08).
- Reglas aplicables: RN-08 (multiasignación y resolución de avance), RN-10 (permisos de edición).

### CU-05 — Registro de Avance
**Como** Colaborador, **quiero** registrar el Avance de una Actividad asignada (porcentaje, Estado, Observaciones), **para** reflejar el progreso real del Proyecto.
- Alcance: solo sobre Actividades asignadas; queda en el histórico con autor y fecha/hora.
- Reglas aplicables: RN-02 (cálculo de avance), RN-05 (monotonía del avance), RN-09 (campos obligatorios), RN-10.

### CU-06 — Carga de Evidencias
**Como** Colaborador, **quiero** adjuntar Evidencias (Enlace, Imagen, Archivo adjunto, Documento de soporte, Observación) a un Avance/Actividad, **para** respaldar el progreso reportado.
- Alcance: validación de tipo/tamaño; toda Evidencia es Privada; trazabilidad de autor y fecha.
- Reglas aplicables: RN-06 (todas las Evidencias son Privadas), RN-09 (campos obligatorios), RN-13, RN-14.

### CU-07 — Cambio autorizado de Línea Base
**Como** Administrador, **quiero** modificar una fecha de la Línea Base conservando fecha original, nueva fecha, autor, fecha/hora y justificación, **para** ajustar la planificación sin perder la referencia histórica.
- Alcance: Colaboradores no pueden hacerlo; se conserva historial completo.
- Reglas aplicables: RN-07 (inmutabilidad de la Línea Base y registro de cambios).

### CU-08 — Configuración de Reglas de Alerta
**Como** Administrador, **quiero** configurar la anticipación de las Alertas de vencimiento (p. ej. 7, 3 y 1 día antes), **para** que el sistema avise a tiempo.
- Alcance: parámetros configurables, no fijados en código.
- Reglas aplicables: RN-03 (umbrales próxima a vencer/vencida), RN-11 (no duplicar alertas).

### CU-09 — Recepción de Notificaciones
**Como** Colaborador o Administrador, **quiero** recibir por correo las Notificaciones y Alertas relevantes, **para** enterarme de vencimientos, confirmaciones y cambios importantes sin tener que revisar la plataforma constantemente.
- Alcance: activación de cuenta, recuperación de contraseña, 2FA (si aplica), próxima a vencer, vencida, confirmación de Avance, cambios importantes.
- Reglas aplicables: RN-11 (cada Alerta se emite una sola vez por umbral), RN-12 (qué es un "cambio importante").

### CU-10 — Consulta de Auditoría
**Como** Administrador, **quiero** consultar el registro de Auditoría filtrando por Usuario, entidad, rango de fechas y tipo de acción, **para** rastrear quién hizo qué y cuándo.
- Alcance: solo lectura; registros inmutables; incluye accesos/modificaciones a datos sensibles.
- Reglas aplicables: RN-17 (registro de acceso/modificación a datos sensibles), RN-18 (inmutabilidad de la Auditoría).

---

## 3. Flujos generales (extremo a extremo)

Estos flujos resumen la operación esperada según el texto original y sirven de base para las pruebas E2E de fases posteriores.

- **Flujo del Visitante:** entra al Dashboard Público → consulta toda la información del Proyecto (objetivos, Cronograma, avance, Hitos, Indicadores, estados de Actividades, y Línea Base y su evolución) → sale, sin autenticarse ni modificar nada. No accede al contenido/enlace de las Evidencias.
- **Flujo del Colaborador:** recibe correo de activación → activa cuenta → configura 2FA → inicia sesión → ve sus Actividades asignadas → registra un Avance → adjunta Evidencias → guarda; el sistema confirma por correo y todo queda trazado.
- **Flujo del Administrador:** inicia sesión con 2FA → crea/gestiona Usuarios → asigna Actividades → autoriza cambios de Línea Base con justificación → configura Reglas de Alerta → consulta Auditoría.
- **Flujo del Sistema de Notificaciones:** evalúa periódicamente el Cronograma → detecta Actividades próximas a vencer o vencidas según las Reglas de Alerta → envía las Alertas por correo una sola vez por umbral → registra el envío.
