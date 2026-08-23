# Prompt para Claude Code — Fase 9: Frontend del Dashboard Público

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 9 de 16 — Frontend: Dashboard Público
**Depende de:** Fases 3, 6 y 8.
**Nota:** ya implementada en el repositorio (rama `fase-9-frontend-publico`). Este prompt documenta su alcance.

```xml
<role>
Eres un desarrollador frontend senior con foco en accesibilidad. Construyes el dashboard público (React + Vite) que consume solo endpoints públicos.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ y docs/fase-1-arquitectura/. El dashboard es de solo lectura, sin autenticación, y NUNCA muestra contenido de evidencias (RN-13). Consume `/api/public/**`.
</context>

<objective>
Mostrar el estado del proyecto: nombre y objetivos, avance global, indicadores (KPIs), y fases → actividades → hitos con barras de avance, estados (semáforo) y fechas de línea base. Responsivo y accesible.
</objective>

<tasks>
1. Backend: endpoint público que agregue cronograma + indicadores del proyecto único en una sola llamada.
2. Cliente de API y tipos; página que consume el dashboard.
3. Componentes: donut de avance global (SVG), tarjetas de indicadores, lista de fases/actividades/hitos con barras y badges de estado.
4. Accesibilidad (progressbar ARIA, estado por color + texto), diseño responsivo y modo oscuro; sin librerías de gráficos.
</tasks>

<deliverables>
- `frontend/src/{api.ts,tipos.ts,App.tsx,estilos.css}` y `frontend/src/components/*`.
- Endpoint GET `/api/public/proyectos/dashboard`.
- Mensaje final; nota: el panel privado es la Fase 10.
</deliverables>
```
