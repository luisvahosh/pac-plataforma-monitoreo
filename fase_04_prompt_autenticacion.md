# Prompt para Claude Code — Fase 4: Autenticación, Usuarios, Roles y 2FA

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 4 de 16 — Autenticación, Usuarios, Roles y 2FA
**Depende de:** Fase 3 completada y validada (dominio con Proyecto/Fase/Actividad/Hito/Línea Base). Diseño en `docs/fase-1-arquitectura/` (ver ADR-0004 de autenticación y `04-matriz-roles-permisos.md`).
**Skills de Claude recomendadas:** `engineering:code-review` con foco en seguridad (revisión del módulo antes de avanzar). No hay skill dedicada de autenticación/2FA; las buenas prácticas van en este prompt.

> **Fase de máxima sensibilidad de seguridad.** Requiere revisión de seguridad dedicada antes de continuar a la Fase 5. En esta fase se escriben pruebas (incluidas de control de acceso negativo).

Copia y pega el bloque completo de abajo (desde `<role>` hasta `</deliverables>`) directamente en Claude Code.

---

```xml
<role>
Eres un ingeniero backend senior especializado en seguridad, responsable de la Fase 4 de un proyecto de desarrollo dentro de Claude Code. Tu tarea es implementar la autenticación de usuarios con segundo factor (2FA), la gestión de usuarios y roles por administradores, y la autorización por rol (RBAC) aplicada a los endpoints ya existentes. Sigues estrictamente las decisiones de las Fases 0 y 1. La seguridad es prioritaria: contraseñas nunca en texto plano, 2FA obligatorio sin excepciones, secretos protegidos, y control de acceso verificado en el servidor. Cada regla de seguridad va acompañada de prueba, incluidas pruebas de acceso NO autorizado.
</role>

<context>
Fuentes de verdad:
- Requisitos: `docs/fase-0-requisitos/` (RN-10, RN-14, RN-15, RN-16, RN-17; RNF-SEC-01..06).
- Arquitectura: `docs/fase-1-arquitectura/` — ADR-0004 (auth/2FA), ADR-0007 (correo), `04-matriz-roles-permisos.md` (RBAC), `02-modelo-datos.md` (Usuario, Rol).
- Código: backend NestJS de la Fase 3, con módulos de dominio cuyos endpoints de escritura están HOY sin protección (marcados como temporales). Esta fase los protege.

Decisiones ya tomadas (entradas fijas):
- 2FA mediante Microsoft Authenticator con TOTP estándar (RFC 6238), enrolamiento por QR. No depende de Azure AD/Entra ID (ADR-0004).
- Contraseñas con hashing Argon2id; el secreto TOTP se almacena cifrado en reposo (RN-16, RNF-SEC-02).
- Sesión mediante tokens: access token de vida corta + refresh token.
- Sin autorregistro público: las cuentas las crea un Administrador (RNF-SEC-05).
- Correo transaccional vía Office 365 / Microsoft 365 (ADR-0007): Microsoft Graph API con OAuth2 (client credentials) como implementación recomendada, SMTP autenticado como alternativa. Debe quedar detrás de una interfaz de envío desacoplada, con una implementación de desarrollo/pruebas (log o SMTP de pruebas) que no envíe correos reales.
- Roles: Administrador y Colaborador (matriz RBAC de la Fase 1).
- Cumplimiento Ley 1581 de 2012 en el tratamiento de datos personales (correos y datos de usuario).

Pregunta abierta relevante: PA-18 (política de contraseñas). Úsala parametrizada con un valor por defecto razonable (longitud mínima, complejidad) y documenta que es ajustable; no la hardcodees de forma rígida.
</context>

<objective>
Implementar el sistema de autenticación y autorización completo del backend: modelo de Usuario y Rol; alta de usuarios por Administrador (sin autorregistro); activación de cuenta por correo; login con contraseña + 2FA (TOTP); emisión y renovación de tokens de sesión; recuperación de contraseña por correo; bloqueo tras intentos fallidos; y RBAC aplicado a los endpoints de la Fase 3 (incluyendo que solo un Administrador pueda cambiar la Línea Base y gestionar usuarios). Todo cubierto con pruebas, incluidas pruebas de acceso no autorizado.
</objective>

<tasks>
1. Leer ADR-0004, ADR-0007 y `04-matriz-roles-permisos.md`; implementar respetándolos. Ante conflicto, prevalecen los documentos (y se reporta).
2. Modelar en Prisma las entidades Usuario y Rol (y los tokens de activación/recuperación), según `02-modelo-datos.md`: Usuario con `password_hash`, `totp_secret_cifrado`, `estado` (pendiente_activacion/activo/inactivo), rol. Añadir la FK diferida `CambioLineaBase.usuarioId → Usuario` (que en la Fase 3 quedó como campo suelto). Generar migración.
3. Implementar el hashing de contraseñas con Argon2id y el cifrado en reposo del secreto TOTP (clave de cifrado desde variable de entorno `CIFRADO_2FA_SECRET`, ya prevista en `.env.example`). Nunca almacenar ni loguear contraseñas ni secretos en claro.
4. Implementar la gestión de usuarios restringida a Administrador: crear (dispara correo de activación), listar, editar, cambiar rol y desactivar (conservando datos, RN-14). Sin endpoint de autorregistro.
5. Implementar el flujo de activación de cuenta: token enviado por correo, con expiración; al activar, el usuario define su contraseña y enrola su 2FA (se le entrega el QR/URI `otpauth://` una sola vez y códigos de respaldo).
6. Implementar el login en dos pasos: (a) usuario + contraseña → reto de 2FA; (b) verificación del código TOTP → emisión de access token + refresh token. Sin 2FA válido no se emite sesión (RN-15). Implementar refresh y logout.
7. Implementar la recuperación de contraseña: solicitud (respuesta neutra que no revela si el correo existe), token por correo con expiración, y restablecimiento; invalidar el token tras su uso.
8. Implementar bloqueo/limitación tras varios intentos fallidos de login o de 2FA (parámetros configurables); registrar el evento.
9. Implementar RBAC: guards/middleware de NestJS que exijan autenticación (y 2FA superado) y rol adecuado. Aplicarlos a los endpoints de la Fase 3: gestión de Proyecto/Fase/Actividad/Hito y, en particular, el cambio de Línea Base solo por Administrador; sustituir las notas temporales "sin auth" por la protección real. Los endpoints públicos (`/api/public/**`) permanecen accesibles sin autenticación.
10. Implementar la interfaz de envío de correo desacoplada con: (a) implementación de producción vía Office 365 (Graph API/OAuth2 recomendado; SMTP como alternativa), y (b) implementación de desarrollo/pruebas que no envíe correos reales (log o SMTP de pruebas). Documentar qué se requiere del tenant de Microsoft 365 (permiso `Mail.Send` o SMTP AUTH habilitado).
11. Escribir pruebas: flujo completo alta de usuario → activación → login con 2FA; control de acceso negativo (colaborador no puede gestionar usuarios ni cambiar Línea Base; acceso sin 2FA rechazado); expiración/invalidación de tokens de recuperación; y verificación de que las contraseñas se almacenan con hashing (nunca en claro).
12. Actualizar el README con los flujos de autenticación, las variables de entorno nuevas, y qué se requiere del tenant de Microsoft 365. NO implementar asignación de actividades ni registro de avances (Fase 5), evidencias (Fase 6), notificaciones (Fase 7) ni la capa de auditoría transversal completa (Fase 8), aunque sí debes emitir los eventos de auditoría básicos de seguridad (login, cambios de usuario) si es barato dejarlos listos.
</tasks>

<architecture>
Respeta ADR-0004 (TOTP estándar, tokens de sesión, Argon2id) y ADR-0007 (correo desacoplado por interfaz). Aplica el RBAC de `04-matriz-roles-permisos.md`. No introduzcas dependencia de Azure AD/Entra ID para el 2FA. El worker/scheduler no participa en esta fase.
</architecture>

<technologies>
Stack existente: NestJS, Prisma, PostgreSQL, TypeScript. Añade únicamente lo necesario para: hashing Argon2id, TOTP (librería compatible con Microsoft Authenticator), tokens de sesión (JWT u equivalente), y envío de correo. Justifica cada dependencia nueva. No introduzcas Redis ni colas (siguen siendo evolución futura); si necesitas almacenar refresh tokens o intentos fallidos, usa PostgreSQL.
</technologies>

<files>
Trabaja dentro de `backend/`:
- `backend/prisma/schema.prisma` + nueva migración: Usuario, Rol, tokens; FK de CambioLineaBase.
- Módulos NestJS: `auth/` (login, 2FA, activación, recuperación, refresh/logout, guards), `usuario/` (gestión por Administrador), `rol/` si aplica, y un módulo/servicio de `correo/` con la interfaz y sus implementaciones.
- Guards/decoradores de RBAC reutilizables; aplicarlos a los controladores de dominio de la Fase 3.
- Pruebas junto al código o en `backend/test/`.
- Actualiza `.env.example` con las variables nuevas (secreto de tokens, credenciales de Microsoft 365, parámetros de política de contraseñas y de bloqueo) — sin valores reales.
- Actualiza el `README.md`.

No modifiques los documentos de las Fases 0 y 1.
</files>

<rules>
- Los documentos de las Fases 0 y 1 son la fuente de verdad; no los contradigas.
- Contraseñas SIEMPRE con hashing (Argon2id); nunca en texto plano en base de datos, logs, correos ni respuestas de API (RN-16).
- 2FA obligatorio sin excepciones: ninguna sesión autenticada se emite sin superar el segundo factor (RN-15).
- Secreto TOTP cifrado en reposo; clave de cifrado desde variable de entorno, nunca hardcodeada.
- Sin autorregistro: no existe endpoint público de creación de cuenta (RNF-SEC-05).
- Respuestas neutras en recuperación de contraseña (no revelar si un correo existe).
- RBAC verificado en el servidor; el control no puede depender del frontend.
- Datos personales tratados conforme a la Ley 1581 (finalidad, deber de información, derechos del titular); no exponer datos personales innecesarios en las APIs.
- Política de contraseñas y umbrales de bloqueo PARAMETRIZADOS (PA-18), con valores por defecto documentados.
- Toda regla de seguridad va con prueba, incluidas pruebas de acceso NO autorizado.
</rules>

<security>
- Almacenamiento de contraseñas con Argon2id (parámetros de coste documentados y ajustables).
- Secreto TOTP y refresh tokens protegidos; refresh tokens revocables (p. ej. almacenados/hasheados en base de datos con posibilidad de invalidación).
- Tokens de activación y recuperación de un solo uso, con expiración corta, invalidados tras su uso.
- Bloqueo/limitación tras N intentos fallidos de contraseña o de 2FA (configurable).
- No filtrar en errores si el fallo fue por usuario inexistente vs. contraseña incorrecta.
- Registrar eventos de seguridad (login exitoso/fallido, alta/baja de usuario, cambio de rol) para la auditoría (RN-17); la capa transversal completa es de la Fase 8, pero deja emitidos los eventos si es barato.
- Preparar el terreno para el hardening de la Fase 12 (rate limiting específico, cabeceras de seguridad) sin implementarlo aún, salvo el bloqueo por intentos que sí corresponde aquí.
- Nunca loguear contraseñas, secretos TOTP, tokens ni credenciales de correo.
</security>

<testing>
Pruebas de esta fase (incluyen casos negativos):
1. Flujo completo: un Administrador crea un Colaborador → se genera token de activación (correo simulado) → el Colaborador activa, define contraseña y enrola 2FA → inicia sesión con contraseña + código TOTP correcto → obtiene sesión.
2. Acceso sin 2FA válido es rechazado (no se emite sesión).
3. Control de acceso negativo: un Colaborador autenticado NO puede crear/editar usuarios ni cambiar la Línea Base (403); un no autenticado no accede a endpoints protegidos (401); los endpoints públicos siguen accesibles sin sesión.
4. Recuperación de contraseña: token válido restablece; token expirado o ya usado es rechazado; la solicitud da respuesta neutra.
5. Seguridad de almacenamiento: la contraseña se guarda con hashing (no existe la contraseña en claro en la base de datos).
6. Bloqueo tras N intentos fallidos.
Documenta el comando para ejecutar las pruebas (con base de datos de pruebas o entorno dockerizado).
</testing>

<acceptance_criteria>
- Un Administrador puede crear un Colaborador; este recibe correo de activación (simulado en pruebas), configura 2FA e inicia sesión correctamente.
- Un intento de acceso sin 2FA válido es rechazado.
- Un Colaborador no puede acceder a funciones fuera de su rol (gestión de usuarios, cambio de Línea Base): verificado por pruebas.
- Los endpoints de escritura de la Fase 3 quedan protegidos por RBAC; los públicos siguen accesibles sin autenticación.
- Las contraseñas se almacenan con hashing (Argon2id) y el secreto TOTP cifrado; nunca en claro.
- Los tokens de activación/recuperación expiran e se invalidan tras su uso.
- Existe bloqueo tras intentos fallidos.
- El envío de correo está desacoplado tras una interfaz, con implementación de pruebas que no envía correos reales.
- Pruebas (incluidas de acceso no autorizado) pasan.
- README y `.env.example` actualizados; documentado qué requiere el tenant de Microsoft 365.
</acceptance_criteria>

<deliverables>
1. Esquema Prisma ampliado (Usuario, Rol, tokens; FK de CambioLineaBase) y migración aplicable.
2. Módulo de autenticación: login en dos pasos con 2FA (TOTP), refresh/logout, activación de cuenta, recuperación de contraseña, bloqueo por intentos.
3. Gestión de usuarios y roles restringida a Administrador (sin autorregistro).
4. RBAC (guards/decoradores) aplicado a los endpoints de la Fase 3; cambio de Línea Base solo por Administrador; públicos intactos.
5. Interfaz de envío de correo con implementación de producción (Office 365) y de pruebas.
6. Suite de pruebas, incluidas pruebas de acceso NO autorizado.
7. README y `.env.example` actualizados; nota sobre requisitos del tenant de Microsoft 365.
8. Un mensaje final de Claude Code que resuma: qué se implementó, evidencia de las pruebas de flujo y de acceso negativo pasando, qué requiere confirmarse del tenant de Microsoft 365 (SMTP AUTH vs. Graph API), y qué queda para la Fase 5 (asignación de actividades y registro de avances con autoría y pesos por colaborador).
</deliverables>
```

---

## Antes de usar este prompt

Ejecuta esta fase **después de validar la Fase 3**. Dos puntos a confirmar idealmente antes o durante:
- **PA-18 (política de contraseñas):** si tienes requisitos concretos, indícalos; si no, se usa un valor por defecto razonable y parametrizado.
- **Correo con Microsoft 365 (ADR-0007):** confirma con quien administra el tenant si está habilitado **SMTP AUTH** o si hay que registrar una app en **Entra ID** con permiso `Mail.Send`. El código funciona en pruebas con un emisor simulado, pero el envío real depende de esto.

Por ser la fase de mayor sensibilidad, conviene una **revisión de seguridad dedicada** (skill `engineering:code-review`) antes de pasar a la Fase 5.

## Después de ejecutar esta fase en Claude Code

1. Corre las pruebas de flujo de autenticación y de control de acceso negativo.
2. Verifica que los endpoints de escritura quedaron protegidos y los públicos siguen abiertos.
3. Cuando valides la autenticación, dímelo y preparo el prompt de la **Fase 5 — Asignación de Actividades y Registro de Avances**.
