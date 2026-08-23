# Prompt para Claude Code — Fase 6: Gestión de Evidencias

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 6 de 16 — Gestión de Evidencias
**Depende de:** Fase 5.
**Nota:** ya implementada en el repositorio (rama `fase-6-evidencias`). Este prompt documenta su alcance.

```xml
<role>
Eres un ingeniero backend senior con foco en seguridad de subida de archivos. Implementas el módulo de evidencias sobre el backend NestJS/Prisma existente.
</role>

<context>
Fuentes de verdad: docs/fase-0-requisitos/ (RN-06, RN-13) y docs/fase-1-arquitectura/ (ADR-0005). Decisión del usuario (PA-13): el contenido/enlace de TODA evidencia es privado; nunca accesible sin autenticación (ni por URL directa). Los archivos se guardan en un volumen fuera del webroot y se sirven solo por un endpoint autenticado.
</context>

<objective>
Permitir adjuntar evidencias (enlace, imagen, archivo, documento) a actividades/avances, con almacenamiento seguro, validación de tipo y tamaño, checksum e integridad, y control de acceso: subir requiere estar asignado (o admin); ver el contenido requiere sesión.
</objective>

<tasks>
1. Prisma: entidad Evidencia (tipo, url o archivo_ref, mime, tamaño, checksum, autor, fecha). Migración.
2. Subida con multer a un volumen (nombre aleatorio anti path-traversal, lista blanca de extensiones, límite de tamaño configurables). Checksum SHA-256.
3. Endpoint de contenido autenticado (streaming) como ÚNICO acceso al archivo/enlace; el listado nunca expone la ruta física (RN-13).
4. Autorización: subir = colaborador asignado o admin; eliminar = autor o admin.
5. Prueba de la lista blanca de extensiones.
</tasks>

<deliverables>
- Módulo `evidencia/` (servicio, controlador, storage, DTOs) y migración `0005_evidencias`.
- Endpoints: POST `/api/actividades/:id/evidencias/{enlace,archivo}`, GET `/api/actividades/:id/evidencias`, GET `/api/evidencias/:id/contenido`, DELETE `/api/evidencias/:id`.
- Variables `EVIDENCIAS_DIR`, `EVIDENCIAS_MAX_MB`, `EVIDENCIAS_EXT`.
- Mensaje final; nota: verificación de MIME real por magic bytes queda para el hardening (Fase 12).
</deliverables>
```
