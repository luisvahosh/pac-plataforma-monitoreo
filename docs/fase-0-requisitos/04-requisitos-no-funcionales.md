# 04 — Requisitos No Funcionales

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** Borrador — pendiente de aprobación del usuario

Los términos empleados están definidos en `01-glosario.md`. Los requisitos con valores aún no fijados por el usuario se marcan como ⛔ **Por confirmar** y remiten a `05-preguntas-abiertas.md`; **no se asume** ningún valor. Los que sí se derivan del texto original se marcan ✅ **Confirmada**.

Este documento **no** propone stack, arquitectura ni modelo de datos; solo requisitos de calidad que la Fase 1 deberá respetar.

---

## 1. Disponibilidad y continuidad

- **RNF-01 — Disponibilidad esperada** ⛔ Por confirmar. Falta fijar el objetivo (p. ej. 99,0 % / 99,5 % / 99,9 % mensual). Ver PA-01.
- **RNF-02 — Ventanas de mantenimiento.** El Dashboard Público debe seguir sirviendo información de solo lectura durante tareas de mantenimiento no destructivas siempre que sea posible. ⛔ Por confirmar el nivel de tolerancia. Ver PA-01.

## 2. Rendimiento y capacidad

- **RNF-03 — Tiempo de respuesta del Dashboard Público** ⛔ Por confirmar. Objetivo propuesto para confirmación: carga útil inicial por debajo de un umbral (p. ej. ≤ 2,5 s en conexión estándar). No se implementa hasta aprobarse. Ver PA-02.
- **RNF-04 — Usuarios concurrentes** ⛔ Por confirmar. Falta estimar concurrencia de Visitantes y de Usuarios autenticados (Colaboradores/Administradores). Ver PA-03.
- **RNF-05 — Volumen de datos** ⛔ Por confirmar. Falta estimar el número de Actividades, Hitos, Avances y Evidencias a lo largo de la vida del Proyecto. Referencia de dominio conocida: la documentación base del PAC define 6 componentes estratégicos y 18 entregables, lo que acota el orden de magnitud inicial de Fases y Actividades, pero no el volumen de Avances ni de Evidencias. Ver PA-04.

## 3. Almacenamiento de Evidencias

- **RNF-06 — Tamaño máximo por archivo** ⛔ Por confirmar (p. ej. 10 / 25 / 50 MB por Evidencia). Ver PA-05.
- **RNF-07 — Tipos de archivo permitidos** ⛔ Por confirmar. Debe definirse una lista blanca de formatos aceptados para Imagen, Archivo adjunto y Documento de soporte. Ver PA-05.
- **RNF-08 — Volumen total de Evidencias** ⛔ Por confirmar; impacta el dimensionamiento de almacenamiento. Ver PA-04, PA-06.

## 4. Retención de datos

- **RNF-09 — Retención de Evidencias** ⛔ Por confirmar (¿se conservan durante toda la vida del Proyecto y después? ¿por cuánto tiempo?). Ver PA-06.
- **RNF-10 — Retención de la Auditoría** ⛔ Por confirmar (periodo mínimo de conservación de los registros de Auditoría). Ver PA-06.
- **RNF-11 — Conservación por trazabilidad** ✅ Confirmada. Los Avances y Evidencias de Usuarios desactivados o eliminados se conservan (coherente con RN-14 de `03-reglas-de-negocio.md`).

## 5. Internacionalización y accesibilidad

- **RNF-12 — Idioma de la interfaz** ⛔ Por confirmar. La documentación base está en español, lo que sugiere español como idioma principal, pero el usuario no lo ha fijado explícitamente ni ha indicado si se requiere multi-idioma. Ver PA-07.
- **RNF-13 — Accesibilidad** ⛔ Por confirmar el nivel objetivo (p. ej. conformidad con pautas de accesibilidad web reconocidas, nivel AA). El Dashboard Público es de consulta ciudadana, por lo que la accesibilidad es especialmente relevante. Ver PA-07.
- **RNF-14 — Diseño responsivo.** El Dashboard Público debe ser consultable desde dispositivos móviles y de escritorio. ✅ Confirmada como necesidad (consulta pública), pendiente solo el nivel de accesibilidad formal.

## 6. Usabilidad y trazabilidad operativa

- **RNF-15 — Trazabilidad de acciones** ✅ Confirmada. Toda acción de Usuario y toda modificación quedan trazadas con Usuario y fecha/hora (coherente con RN-17).
- **RNF-16 — Confirmaciones al Usuario** ✅ Confirmada. El registro de un Avance genera una confirmación por correo al Colaborador (coherente con los tipos de Notificación del texto original).

## 7. Seguridad (subsección obligatoria)

Estas son las bases de seguridad que **todas** las fases posteriores deben respetar. El detalle de algoritmos y mecanismos concretos corresponde a la Fase 1; aquí se fijan los requisitos, no las tecnologías.

- **RNF-SEC-01 — 2FA obligatorio, sin excepciones** ✅ Confirmada. Todo Colaborador y todo Administrador debe superar un segundo factor de autenticación además de usuario y contraseña. Ningún acceso autenticado es posible sin 2FA válido (coherente con RN-15).
- **RNF-SEC-02 — Contraseñas nunca en texto plano** ✅ Confirmada. Las contraseñas jamás se almacenan ni se registran en texto plano en ningún medio (base de datos, logs, Auditoría, correos). El algoritmo concreto de protección se decide en Fase 1 (coherente con RN-16). El mecanismo de 2FA quedó definido (PA-17): **aplicación autenticadora — Microsoft Authenticator**; el protocolo técnico (TOTP/push) se detalla en Fase 1. La política de contraseñas sigue pendiente (ver PA-18).
- **RNF-SEC-03 — Contenido de Evidencias inaccesible sin autenticación** ✅ Confirmada. El contenido o enlace de cualquier Evidencia nunca es accesible sin autenticación, ni siquiera mediante acceso directo a su URL (coherente con RN-13). El resto de la información del Proyecto sí es pública.
- **RNF-SEC-04 — Auditoría de datos sensibles** ✅ Confirmada. Todo acceso o modificación a datos sensibles queda registrado en la Auditoría, de forma inmutable y atribuible (coherente con RN-17 y RN-18).
- **RNF-SEC-05 — Sin autorregistro público** ✅ Confirmada. Las cuentas solo las crea un Administrador; no existe registro público de Usuarios.
- **RNF-SEC-06 — Protección de datos personales (Ley 1581 de 2012)** ✅ Confirmada (PA-19). La plataforma trata datos personales (correos y datos de Usuarios) y debe cumplir la **Ley 1581 de 2012** de Colombia y su normativa reglamentaria. Obligaciones mínimas que las fases siguientes deben respetar: principio de finalidad y **consentimiento** del titular, **deber de información** sobre el tratamiento, atención de los **derechos del titular** (consulta, actualización, rectificación y supresión de sus datos), y **medidas de seguridad** proporcionales sobre los datos personales almacenados. El detalle procedimental (aviso de privacidad, registro de tratamiento, tiempos de respuesta a titulares) se concreta en fases posteriores; aquí queda fijado como requisito.

## 8. Notas trasladadas a la Fase 1 (no se deciden aquí)

Estas necesidades técnicas se detectaron durante el análisis y se registran para la Fase 1, sin resolverse en Fase 0:

- Estrategia de almacenamiento de archivos de Evidencia y su dimensionamiento (depende de RNF-06/07/08).
- Mecanismo de tareas programadas para el Sistema de Notificaciones (Scheduler) que no dependa de que un Usuario tenga el navegador abierto.
- Restricción de despliegue dada por el usuario: Hostinger + Docker + PostgreSQL; confirmar recursos del plan y compatibilidad (ver PA-20, PA-21).
- **Envío de correo definido (PA-22): cuenta Office 365 / Microsoft 365** conectada a la aplicación como proveedor SMTP de producción. En Fase 1 se detalla la integración (SMTP autenticado de Microsoft 365 u otra vía compatible) y el manejo de credenciales.
- **Segundo factor definido (PA-17): Microsoft Authenticator** (aplicación autenticadora). En Fase 1 se decide el protocolo (TOTP estándar u otra integración compatible con Microsoft Authenticator).
