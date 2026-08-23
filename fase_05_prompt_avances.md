# Prompt para Claude Code — Fase 5: Asignación de Actividades y Registro de Avances

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 5 de 16 — Asignación de Actividades y Registro de Avances
**Depende de:** Fases 3 (dominio) y 4 (auth/RBAC).
**Nota:** esta fase ya está implementada en el repositorio (rama `fase-5-avances`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero backend senior. Implementas la asignación de actividades a colaboradores y el registro de avances, con trazabilidad completa (autor, fecha/hora) y autorización por rol, sobre el backend NestJS/Prisma existente. Escribes pruebas.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (RN-02, RN-05, RN-08, RN-10) y docs/fase-1-arquitectura/. El backend ya tiene dominio (Fase 3) y autenticación con RBAC (Fase 4). Decisiones: una actividad puede tener varios colaboradores con un peso de trabajo (suman 100 %); el avance de la actividad se pondera por ese peso (RN-02/RN-08); el avance puede subir y bajar y queda en histórico (RN-05); un colaborador solo opera sus actividades asignadas (RN-10).
</context>

<objective>
Permitir que administradores asignen actividades (con peso por colaborador) y que los colaboradores registren avances sobre sus actividades asignadas, recalculando el avance ponderado de la actividad, con histórico y autorización, cubierto por pruebas.
</objective>

<tasks>
1. Prisma: entidades Asignacion (actividad–usuario, peso de trabajo) y Avance (append-only: porcentaje, observaciones, autor, fecha/hora). Migración.
2. Asignación de actividades por Administrador; endpoint de "mis actividades" del colaborador; listado con validación de suma de pesos = 100 %.
3. Registro de avances por el colaborador asignado (o admin); histórico cronológico; recálculo del avance de la actividad ponderado por peso (función pura testeable).
4. Autorización: colaborador solo sobre lo asignado (403 si no); admin sobre cualquiera.
5. Pruebas unitarias: avance ponderado por colaborador y control de acceso (casos negativos).
</tasks>

<deliverables>
- Módulos NestJS `avance/` y `asignacion/` (servicios, controladores, DTOs) y migración `0004_avances`.
- Función de dominio `avanceActividadPonderado` con pruebas.
- Endpoints: POST/GET `/api/actividades/:id/asignaciones`, POST/GET `/api/actividades/:id/avances`, GET `/api/mis-actividades`.
- Mensaje final resumiendo lo implementado y qué queda para la Fase 6 (evidencias).
</deliverables>
```
