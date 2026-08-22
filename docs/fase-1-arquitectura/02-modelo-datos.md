# 02 — Modelo de Datos Conceptual (Entidad-Relación)

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 1 de 16 — Arquitectura y Diseño Técnico
**Estado:** Borrador — pendiente de aprobación del usuario

Modelo conceptual (no físico): describe entidades, atributos clave y relaciones que soportan las reglas de negocio de la Fase 0. Terminología según `docs/fase-0-requisitos/01-glosario.md`.

## Diagrama entidad-relación

```mermaid
erDiagram
    PROYECTO ||--o{ FASE : contiene
    FASE ||--o{ ACTIVIDAD : contiene
    ACTIVIDAD ||--o{ HITO : tiene
    ACTIVIDAD ||--o{ ASIGNACION : tiene
    USUARIO ||--o{ ASIGNACION : recibe
    ACTIVIDAD ||--o{ AVANCE : registra
    USUARIO ||--o{ AVANCE : autor
    AVANCE ||--o{ EVIDENCIA : respalda
    ACTIVIDAD ||--o{ EVIDENCIA : adjunta
    USUARIO ||--o{ EVIDENCIA : sube
    ACTIVIDAD ||--o{ CAMBIO_LINEA_BASE : historial
    HITO ||--o{ CAMBIO_LINEA_BASE : historial
    USUARIO ||--o{ CAMBIO_LINEA_BASE : autoriza
    ROL ||--o{ USUARIO : clasifica
    USUARIO ||--o{ TOKEN_CUENTA : posee
    REGLA_ALERTA ||--o{ NOTIFICACION_ENVIADA : origina
    USUARIO ||--o{ NOTIFICACION_ENVIADA : destinatario
    USUARIO ||--o{ EVENTO_AUDITORIA : actor

    PROYECTO {
        uuid id PK
        string nombre
        text descripcion
        text objetivos
        date fecha_inicio
        date fecha_fin
    }
    FASE {
        uuid id PK
        uuid proyecto_id FK
        string nombre
        text descripcion
        decimal peso_porcentaje "aporte al proyecto; suma de fases = 100"
        int orden
    }
    ACTIVIDAD {
        uuid id PK
        uuid fase_id FK
        string nombre
        text descripcion
        date fecha_inicio_plan "linea base vigente"
        date fecha_fin_plan "linea base vigente"
        boolean finalizada
    }
    HITO {
        uuid id PK
        uuid actividad_id FK
        string nombre
        date fecha_objetivo "linea base vigente"
        boolean cumplido
    }
    ASIGNACION {
        uuid id PK
        uuid actividad_id FK
        uuid usuario_id FK
        decimal peso_trabajo_porcentaje "suma por actividad = 100"
    }
    AVANCE {
        uuid id PK
        uuid actividad_id FK
        uuid usuario_id FK
        decimal porcentaje "0-100"
        text observaciones
        timestamptz fecha_hora
    }
    EVIDENCIA {
        uuid id PK
        uuid actividad_id FK
        uuid avance_id FK "nullable"
        uuid autor_id FK
        string tipo "enlace|imagen|archivo|documento|observacion"
        text url "solo tipo enlace"
        string archivo_ref "ruta interna en volumen; nunca publica"
        string nombre_archivo
        string mime
        bigint tamano_bytes
        text observacion
        timestamptz fecha_hora
    }
    CAMBIO_LINEA_BASE {
        uuid id PK
        string entidad_tipo "actividad|hito"
        uuid entidad_id
        string campo "fecha_inicio|fecha_fin|fecha_objetivo"
        date fecha_original
        date fecha_nueva
        uuid usuario_id FK "administrador"
        timestamptz fecha_hora_cambio
        text justificacion
    }
    USUARIO {
        uuid id PK
        uuid rol_id FK
        string nombre
        string email UK
        string password_hash "Argon2id; nunca texto plano"
        string totp_secret_cifrado
        string estado "pendiente_activacion|activo|inactivo"
        timestamptz creado_en
    }
    ROL {
        uuid id PK
        string nombre "administrador|colaborador"
    }
    TOKEN_CUENTA {
        uuid id PK
        uuid usuario_id FK
        string tipo "activacion|recuperacion"
        string token_hash
        timestamptz expira_en
        boolean usado
    }
    REGLA_ALERTA {
        uuid id PK
        string ambito "global|actividad"
        uuid actividad_id FK "nullable si global"
        int_array dias_anticipacion "p.ej. [7,3,1]"
        boolean activo
    }
    NOTIFICACION_ENVIADA {
        uuid id PK
        string tipo "activacion|recuperacion|proxima_vencer|vencida|confirmacion_avance|cambio_importante"
        uuid usuario_id FK
        string entidad_tipo
        uuid entidad_id
        int umbral_dias "nullable"
        timestamptz fecha_hora
    }
    EVENTO_AUDITORIA {
        uuid id PK
        uuid usuario_id FK "nullable si sistema"
        string accion "crear|editar|eliminar|acceso_sensible|login|cambio_linea_base"
        string entidad_tipo
        uuid entidad_id
        jsonb detalle_antes
        jsonb detalle_despues
        string ip
        timestamptz fecha_hora
    }
```

## Descripción de entidades

- **PROYECTO:** único registro; información general, objetivos y fechas globales.
- **FASE:** pertenece a un Proyecto; tiene `peso_porcentaje` (aporte al Proyecto). **Invariante:** la suma de pesos de las Fases del Proyecto = 100 % (RN-02).
- **ACTIVIDAD:** pertenece a una Fase. Guarda las fechas de la **Línea Base vigente** (`fecha_inicio_plan`, `fecha_fin_plan`) y `finalizada`. El **Estado** (Pendiente/En ejecución/Finalizada/Próxima a vencer/Vencida) es **derivado** en tiempo de consulta a partir de fechas, `finalizada` y las Reglas de Alerta (RN-03, RN-04); no se almacena para evitar inconsistencias.
- **HITO:** pertenece a una **Actividad** (RN-01); tiene `fecha_objetivo` (parte de la Línea Base) y `cumplido`.
- **ASIGNACION:** relación Actividad–Usuario(Colaborador) con `peso_trabajo_porcentaje`. **Invariante:** la suma de pesos por Actividad = 100 % (RN-08). Clave única (actividad_id, usuario_id).
- **AVANCE:** histórico append-only por Actividad y autor; `porcentaje` puede subir o bajar entre registros (RN-05). El último Avance por Colaborador alimenta el cálculo (RN-02).
- **EVIDENCIA:** asociada a una Actividad y opcionalmente a un Avance. Su **contenido/enlace es siempre privado** (RN-06, RN-13): los archivos se guardan como `archivo_ref` dentro del volumen y solo se sirven por endpoint autenticado; nunca por ruta pública. `url` solo aplica al tipo `enlace`.
- **CAMBIO_LINEA_BASE:** historial **inmutable** de cambios autorizados a fechas de la Línea Base (RN-07). Conserva `fecha_original`, `fecha_nueva`, `usuario_id`, `fecha_hora_cambio` y `justificacion`. La `fecha_original` nunca se sobrescribe: la Actividad/Hito guarda la fecha vigente y este historial preserva todas las anteriores.
- **USUARIO / ROL:** cuentas creadas por Administrador (sin autorregistro). `password_hash` con Argon2id (RN-16); `totp_secret_cifrado` para 2FA (RN-15). `estado` soporta activación y desactivación conservando datos (RN-14).
- **TOKEN_CUENTA:** tokens de activación y recuperación con expiración y marca de uso (soporta CU-03, flujos de correo).
- **REGLA_ALERTA:** configuración de anticipación de Alertas, global o por Actividad (RN-03, PA-08/PA-12); `dias_anticipacion` parametrizable, no hardcodeado.
- **NOTIFICACION_ENVIADA:** registro de envíos para **deduplicar** Alertas (una por umbral, RN-11) y para auditoría.
- **EVENTO_AUDITORIA:** registro **append-only** de acciones y accesos a datos sensibles (RN-17), inmutable (RN-18).

## Cómo el modelo soporta las reglas críticas

| Regla | Soporte en el modelo |
|------|----------------------|
| RN-01 (jerarquía; Hito→Actividad) | FK `FASE.proyecto_id`, `ACTIVIDAD.fase_id`, `HITO.actividad_id`. |
| RN-02 (avance ponderado) | `FASE.peso_porcentaje`, `ASIGNACION.peso_trabajo_porcentaje`; `AVANCE` como fuente; constraints `CHECK` de suma = 100 %. |
| RN-05 (avance sube/baja) | `AVANCE` append-only; sin restricción de monotonía; histórico completo. |
| RN-07 (línea base inmutable) | Fecha vigente en `ACTIVIDAD`/`HITO` + historial en `CAMBIO_LINEA_BASE` (sin update/delete). |
| RN-08 (multiasignación) | `ASIGNACION` N:M con peso; único por (actividad, usuario). |
| RN-06/RN-13 (evidencia privada) | `archivo_ref` fuera de webroot; servido solo por endpoint autenticado. |
| RN-14 (conservación) | `USUARIO.estado=inactivo` en lugar de borrar; FKs de Avance/Evidencia preservan autoría. |
| RN-11 (no duplicar alertas) | Unicidad lógica en `NOTIFICACION_ENVIADA` por (tipo, entidad, umbral_dias). |
| RN-16 (contraseñas) | `password_hash` (Argon2id); nunca se almacena texto plano. |
| RN-17/RN-18 (auditoría) | `EVENTO_AUDITORIA` append-only; permisos de BD revocan UPDATE/DELETE. |

## Invariantes a reforzar en base de datos (Fase 3/8)

- `SUM(FASE.peso_porcentaje) = 100` por Proyecto.
- `SUM(ASIGNACION.peso_trabajo_porcentaje) = 100` por Actividad (cuando hay asignaciones).
- `AVANCE.porcentaje BETWEEN 0 AND 100`.
- `EVENTO_AUDITORIA` y `CAMBIO_LINEA_BASE`: sin `UPDATE`/`DELETE` para el rol de aplicación.
- Unicidad de `USUARIO.email`.

> Nota: los tipos exactos, índices y constraints físicos se materializan en las migraciones de la Fase 3 (dominio) y Fase 8 (auditoría). Este documento es conceptual.
