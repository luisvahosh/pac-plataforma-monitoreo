# Prompt para Claude Code — Fase 7: Notificaciones y Alertas por Correo

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 7 de 16 — Notificaciones y Alertas por Correo
**Depende de:** Fases 4, 5 y 6.
**Nota:** ya implementada en el repositorio (rama `fase-7-notificaciones`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero backend senior. Implementas el sistema automático de notificaciones por correo sobre el backend NestJS existente, con un proceso de servidor independiente del navegador.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (RN-03, RN-11, RN-12, RNF-16) y docs/fase-1-arquitectura/ (ADR-0006, ADR-0007). El correo va por una interfaz desacoplada (modo dev que no envía / SMTP Office 365). Anticipación de alertas configurable (por defecto 7/3/1 días); no se duplican alertas (una por umbral).
</context>

<objective>
Evaluar periódicamente el cronograma y enviar alertas de "próxima a vencer" y "vencida" sin duplicar, confirmar por correo el registro de avances, y permitir a administradores configurar las reglas de anticipación y consultar el log de envíos.
</objective>

<tasks>
1. Prisma: ReglaAlerta (días de anticipación, activo) y NotificacionEnviada (para deduplicar). Migración con regla por defecto [7,3,1].
2. Lógica pura de evaluación de umbrales (con pruebas).
3. Servicio que evalúa vencimientos y envía alertas sin duplicar (registro en NotificacionEnviada, RN-11).
4. Scheduler diario (@nestjs/schedule) + disparo manual para pruebas; puede migrarse al contenedor worker.
5. Confirmación de avance por correo (RNF-16), integrada en el registro de avances sin romperlo si el correo falla.
6. Endpoints admin: GET/PUT reglas-alerta; GET notificaciones/enviadas; POST notificaciones/evaluar.
</tasks>

<deliverables>
- Módulo `notificacion/` (servicio, scheduler, regla-alerta, controlador, DTO) y migración `0006_notificaciones`.
- Extensión de `CorreoService` con alertas y confirmación; lógica `dominio/alertas.ts` con pruebas.
- Mensaje final; nota: "cambios importantes" (RN-12/PA-16) quedan por definir.
</deliverables>
```
