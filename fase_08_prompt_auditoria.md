# Prompt para Claude Code — Fase 8: Auditoría y Trazabilidad

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 8 de 16 — Auditoría y Trazabilidad
**Depende de:** Fases 3 a 7.
**Nota:** ya implementada en el repositorio (rama `fase-8-auditoria`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero backend senior. Implementas una capa transversal de auditoría inmutable sobre el backend NestJS existente.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (RN-17, RN-18) y docs/fase-1-arquitectura/ (ADR-0010). Toda acción de creación/modificación/eliminación y todo acceso a datos sensibles debe registrarse con usuario, fecha/hora, acción y entidad. El registro es append-only e inmutable: sin endpoints de modificación/borrado.
</context>

<objective>
Registrar automáticamente las mutaciones como eventos de auditoría (sin capturar datos sensibles), ofrecer una consulta filtrable solo para administradores, y garantizar la inmutabilidad del registro.
</objective>

<tasks>
1. Prisma: entidad EventoAuditoria (usuario, acción, entidad_tipo, entidad_id, detalle jsonb, ip, fecha). Migración con índices.
2. Interceptor GLOBAL que audita toda mutación exitosa (POST/PUT/PATCH/DELETE) con usuario/fecha/acción/entidad/IP; no guarda el cuerpo; omite rutas /auth.
3. Consulta filtrable (usuario, entidad, acción, rango de fechas) solo para Administrador y solo lectura.
4. Utilidades puras (acción por método, entidad por ruta, ruta sensible) con pruebas.
5. Nota: la inmutabilidad a nivel de BD (revocar UPDATE/DELETE al rol de app) se aplica en el despliegue (Fase 13).
</tasks>

<deliverables>
- Módulo `auditoria/` (servicio, interceptor global, controlador, util) y migración `0007_auditoria`.
- Endpoint GET `/api/auditoria` (admin).
- Mensaje final resumiendo cobertura de auditoría.
</deliverables>
```
