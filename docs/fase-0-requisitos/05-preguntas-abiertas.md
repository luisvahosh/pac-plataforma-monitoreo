# 05 — Preguntas Abiertas

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 0 de 16 — Descubrimiento y Definición de Requisitos
**Estado:** Borrador — pendiente de aprobación del usuario

Cada pregunta está redactada como **cerrada o de opción múltiple** para que puedas responderla rápido. Marca una opción por pregunta (o escribe tu propia respuesta). Ninguna de estas preguntas tiene ya respuesta en el texto de requerimientos original.

**Prioridad:**
- 🔴 **Bloqueante de Fase 1** — sin esta respuesta no se puede diseñar arquitectura/modelo de datos con precisión.
- 🟡 **Importante, no bloqueante** — se puede empezar Fase 1, pero debe resolverse antes de implementar el módulo afectado.
- 🟢 **De dimensionamiento/operación** — necesaria antes de infraestructura y despliegue, no para el diseño lógico.

---

## A. Reglas de negocio (impactan el modelo de datos → mayoría bloqueantes)

**PA-09 🔴 ✅ RESPONDIDA — ¿Cómo se calcula el porcentaje de Avance de una Fase y del Proyecto?**
- **(x) Fase = promedio simple de sus Actividades (sin importar cuántas tenga). Proyecto = suma ponderada de las Fases por su peso**, donde cada Fase aporta un porcentaje al Proyecto y la suma de los pesos de las Fases = 100 %.
*(Relacionada con RN-02. Pendiente menor: quién asigna el peso de cada Fase — se asume el Administrador.)*

**PA-10 🔴 ✅ RESPONDIDA — ¿El porcentaje de Avance de una Actividad puede disminuir?**
- **(x) El Avance puede aumentar y disminuir; toda variación queda en el histórico.**
*(Relacionada con RN-05.)*

**PA-11 🔴 ✅ RESPONDIDA — ¿A qué pertenece un Hito?**
- **(x) b) A una Actividad.** La suma de las Actividades conforma la Fase.
*(Relacionada con RN-01.)*

**PA-13 🔴 ✅ RESPONDIDA — Visibilidad de las Evidencias.**
- **(x) El Dashboard Público muestra toda la información del Proyecto; lo único restringido es el contenido/enlace de las Evidencias, que solo ve un Usuario autenticado.** Se elimina el concepto de Evidencia Pública.
*(Relacionada con RN-06 y RN-13.)*

**PA-14 🔴 ✅ RESPONDIDA — ¿Una Actividad puede tener más de un Colaborador asignado?**
- **(x) Sí; el Avance se pondera por el porcentaje de trabajo (peso) de cada Colaborador en la Actividad** (suma de pesos = 100 %).
*(Relacionada con RN-08 y RN-02.)*

**PA-15 🟡 — ¿Confirmas la lista base de campos obligatorios propuesta en RN-09?**
- ( ) a) Sí, tal cual está en RN-09
- ( ) b) Sí, con estos cambios: __________
- ( ) c) No; propongo esta lista: __________
*(Relacionada con RN-09.)*

**PA-16 🟡 — ¿Qué eventos cuentan como "cambio importante" que debe notificarse por correo?** (marca todos los que apliquen)
- ( ) Cambio de Línea Base
- ( ) Reasignación de una Actividad
- ( ) Una Actividad pasa a estado Vencida
- ( ) Nuevo Avance en una Actividad
- ( ) Otro: __________
*(Relacionada con RN-12.)*

## B. Umbrales y alertas

**PA-08 🟡 — Anticipación por defecto de las Alertas de vencimiento (si el Administrador no configura nada).**
- ( ) a) 7, 3 y 1 día antes
- ( ) b) Solo 3 días antes
- ( ) c) Otro: __________
*(Relacionada con RN-03b.)*

**PA-12 🟡 — ¿Los umbrales de vencimiento son solo globales o también por Actividad?**
- ( ) a) Solo un umbral global para todo el Proyecto
- ( ) b) Global, con posibilidad de sobrescribir por Actividad
*(Relacionada con RN-03.)*

## C. Seguridad y cumplimiento

**PA-17 🔴 ✅ RESPONDIDA — Mecanismo de segundo factor (2FA) preferido.**
- **(x) Aplicación autenticadora — Microsoft Authenticator.** El protocolo técnico concreto (TOTP estándar u otra integración compatible) se decide en Fase 1.
*(Impacta el diseño de autenticación de la Fase 1.)*

**PA-18 🟡 — Política de contraseñas deseada.**
- ( ) a) Estándar recomendado (longitud mínima, complejidad, no reutilización reciente)
- ( ) b) Requisitos específicos: __________
*(No se pregunta el algoritmo de hashing: eso lo decide la Fase 1.)*

**PA-19 🔴 ✅ RESPONDIDA — Normativa de protección de datos personales aplicable.**
- **(x) Ley 1581 de 2012** (régimen general de protección de datos personales / habeas data de Colombia) y su normativa reglamentaria.
*(Relacionada con RNF-SEC-06. Implica: principio de finalidad y consentimiento del titular, deber de información, derechos del titular —consulta, actualización, rectificación, supresión—, y medidas de seguridad sobre los datos personales tratados, incluidos correos y datos de Usuarios.)*

## D. Idioma y accesibilidad

**PA-07 🟡 — Idioma de la interfaz y nivel de accesibilidad.**
- ( ) a) Solo español; accesibilidad nivel AA
- ( ) b) Solo español; sin requisito formal de accesibilidad
- ( ) c) Multi-idioma (indicar cuáles): __________
*(Relacionada con RNF-12, RNF-13.)*

## E. Dimensionamiento (necesario antes de infraestructura)

**PA-03 🟢 — Número estimado de usuarios concurrentes.**
- Visitantes públicos concurrentes en pico: ( ) <50 ( ) 50–200 ( ) 200–1000 ( ) >1000
- Colaboradores/Administradores concurrentes: ( ) <10 ( ) 10–30 ( ) >30

**PA-01 🟢 — Objetivo de disponibilidad.** ( ) 99,0 % ( ) 99,5 % ( ) 99,9 % ( ) Sin objetivo formal

**PA-02 🟢 — Tiempo de respuesta objetivo del Dashboard Público.** ( ) ≤2,5 s ( ) ≤4 s ( ) Sin objetivo formal

**PA-04 🟢 — Volumen esperado de Avances y Evidencias.**
- Nº aproximado de Evidencias durante la vida del Proyecto: __________
- Nº aproximado de Avances por Actividad: __________

**PA-05 🟢 — Tamaño máximo por archivo y tipos permitidos.**
- Tamaño máximo por Evidencia: ( ) 10 MB ( ) 25 MB ( ) 50 MB ( ) Otro: ____
- Tipos permitidos: __________ (p. ej. PDF, JPG, PNG, DOCX, XLSX)

**PA-06 🟢 — Retención de Evidencias y de Auditoría.**
- Evidencias: ( ) toda la vida del Proyecto ( ) N años: ____
- Auditoría: ( ) N años: ____

## F. Infraestructura y despliegue (bloquean la Fase 13, no el diseño lógico)

**PA-20 🟢 — Plan de Hostinger contratado.** ¿Cuál es y qué recursos ofrece (RAM/CPU/disco)? ¿Soporta Docker y Docker Compose? __________

**PA-21 🟢 — Dominio o subdominio definitivo.** __________

**PA-22 🟢 ✅ RESPONDIDA — Proveedor SMTP para producción.** Cuenta **Office 365 / Microsoft 365** conectada a la aplicación para el envío de los correos. La integración concreta (SMTP autenticado de Microsoft 365 u otra vía compatible) se define en Fase 1.

## G. Aclaraciones de dominio

**PA-23 🟡 — ¿"Fase" y "componente/eje estratégico" del PAC son el mismo nivel jerárquico?**
- ( ) a) Sí, son lo mismo (una Fase = un componente estratégico)
- ( ) b) No; hay un nivel intermedio: __________

**PA-24 🟢 — ¿"Archivo adjunto" y "Documento de soporte" deben distinguirse como tipos separados de Evidencia, o pueden unificarse?**
- ( ) a) Distinguirlos
- ( ) b) Unificarlos en un solo tipo "Archivo"

---

## Resumen: estado de las 🔴 bloqueantes de la Fase 1

Respondidas por el usuario (22-ago-2026): **PA-09, PA-10, PA-11, PA-13, PA-14, PA-17, PA-19** ✅ (y **PA-22** — proveedor de correo).

**Ninguna bloqueante 🔴 queda abierta.** La Fase 1 puede iniciarse una vez el usuario apruebe la Fase 0.

Importantes no bloqueantes aún abiertas (se pueden cerrar en paralelo): PA-08, PA-12, PA-15, PA-16, PA-18, PA-23, PA-24 y las de dimensionamiento/despliegue (PA-01 a PA-07, PA-20, PA-21).
