# Prompt para Claude Code — Fase 10: Frontend del Panel Privado y Administración

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 10 de 16 — Frontend: Panel de Colaboradores y Administración
**Depende de:** Fases 4 a 9.
**Nota:** ya implementada en el repositorio (rama `fase-10-frontend-privado`). Este prompt documenta su alcance.

```xml
<role>
Eres un desarrollador frontend senior. Construyes la aplicación autenticada (React + React Router) para colaboradores y administradores.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ y docs/fase-1-arquitectura/ (matriz RBAC). Autenticación con contraseña + 2FA (Microsoft Authenticator). El acceso al contenido de evidencias siempre pasa por el endpoint autenticado (RN-13). El control por rol de la interfaz refleja —no sustituye— la autorización del backend.
</context>

<objective>
Ofrecer login en dos pasos (contraseña + 2FA), "mis actividades" y detalle (registrar avances, cargar/descargar evidencias) para colaboradores, y paneles de administración (usuarios, asignaciones con peso, cambios de línea base, alertas, auditoría).
</objective>

<tasks>
1. Cliente autenticado (tokens en almacenamiento local, refresh automático ante 401) y contexto de autenticación.
2. Login en dos pasos; rutas protegidas por sesión y por rol.
3. Colaborador: "mis actividades" y detalle con registro de avances y evidencias (enlace/archivo, descarga por endpoint autenticado).
4. Administrador: usuarios (crear→activación, desactivar), asignaciones con peso, cambios de línea base con historial, configuración de alertas, consulta de auditoría.
</tasks>

<deliverables>
- `frontend/src/privado/*` (api-cliente, auth-contexto, Login, Layout, RutaProtegida, paginas/…) y router en `main.tsx`.
- Dependencia `react-router-dom`.
- Mensaje final; nota: la integración E2E es la Fase 11.
</deliverables>
```
