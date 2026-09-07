# Plan — Gestión de Actas (Fase 15)

> Funcionalidad NUEVA integrada a la plataforma existente de **administración y
> seguimiento del único proyecto PAC**. No crea otro proyecto, no reemplaza la
> gestión de actividades ni monta un segundo sistema de seguimiento. Reutiliza
> las entidades ya existentes y, cuando hace falta, agrega entidades nuevas que
> se **integran** al seguimiento actual.

Estado: **implementado (rama `fase-15-actas`).**
Fecha: 2026-09-07.

### Estado de implementación

Implementado y verificado (backend compila, frontend build OK, 62/62 pruebas):

- Modelos Prisma + migración `0016_actas` (10 tablas nuevas, no destructiva).
- Motor de avance con roll-up del nivel 4 (`avanceActividadDesdeEjecuciones`,
  `AvanceService.recalcularSubactividad`) + prueba unitaria; reporte directo
  bloqueado cuando la actividad tiene subactividades de ejecución.
- Backend: módulos `ejecucion` (nivel 4 + presupuesto por colaborador),
  `riesgo`, `tarea`, `acta` (CRUD, contexto precargado, resumen, enviar) y
  controlador público `public/actas`.
- Frontend: admin «Gestión de Actas» (lista + editor con datos generales,
  asistentes/invitados, seguimiento del acta anterior, selector de actividad,
  crear subactividad/tarea/riesgo, temas, conclusiones, enviar); reporte del
  nivel 4 integrado en «Mis actividades»/Detalle de actividad; pestaña pública
  «Actas».

Pendiente (documentado, no bloquea el flujo principal):

- **Subida de archivos** de documentos anexos: el modelo `ActaDocumento` existe,
  pero falta el endpoint multipart (reutilizar la infraestructura de Evidencia).
- **Export/impresión FO-GINF-102** (PDF / vista imprimible).
- Actualizar `docs/fase-1-arquitectura/*` y `README.md`; adjuntar el formato
  `FO-GINF-102` al repo.
- Rutas del nivel 4 implementadas como `subactividades/:id/ejecuciones` y
  `ejecuciones/:id/avances` (en vez del `actividades-op` que figuraba abajo).

---

## 1. Alcance

Agregar una sección **Gestión de Actas** para documentar las reuniones de
seguimiento del proyecto y, desde ellas:

- Partir del estado actual del proyecto y del acta anterior (no empezar en blanco).
- Seleccionar actividades existentes para revisarlas.
- Crear **subactividades** (nivel 4, nuevo) para desarrollar una actividad, con
  reporte de avance del colaborador que **suma** al avance de la actividad.
- Crear **tareas / compromisos** (action-items, no pesan en el avance).
- Registrar y hacer seguimiento a **riesgos** (por actividad).
- Registrar desarrollo temático, decisiones y conclusiones.
- Adjuntar documentos.
- Guardar borrador y enviar; al enviar, todo lo creado queda integrado al
  seguimiento del proyecto y es consultable/actualizable después.

**Permisos:** solo **Administrador** crea y gestiona actas. Los colaboradores
**ven** las actas y **reportan avance** de las subactividades que les fueron
asignadas, desde el flujo normal de "Mis actividades".

**Visibilidad pública:** las actas **enviadas** se ven en la parte pública
(lectura). Los **documentos anexos** siguen privados (RN-06 / RN-13, la
evidencia nunca es pública). Los borradores no se publican.

---

## 2. Modelo de dominio confirmado (4 niveles)

La jerarquía real del proyecto tiene HOY tres niveles; las actas introducen un
cuarto nivel nuevo.

| Nivel | Nombre de negocio                      | Tabla actual                       | Asignación / peso                                        |
| ----: | -------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
|     1 | **Componente** (C1..Cn)                | `Fase`                             | `AsignacionComponente` (informativa)                     |
|     2 | **Entregable** (P1..Pn)                | `Actividad`                        | `Asignacion` (suma 100 % por entregable)                 |
|     3 | **Actividad** (P1‑A01, "la tarea")     | `Subactividad`                     | `AsignacionSubactividad` — p. ej. 4 responsables × 25 %  |
|     4 | **Subactividad** ← _nace en las actas_ | **NUEVA: `SubactividadEjecucion`** | asignada a **un** responsable ya asignado a la actividad |

> **Colisión de nombres (a resolver en implementación):** en la BD, la tabla
> `Subactividad` ya representa el nivel 3 ("actividad" del negocio). El nuevo
> nivel 4 el negocio también lo llama "subactividad". Para no chocar, el nivel 4
> se modela como `SubactividadEjecucion` (nombre de tabla/entidad). En la interfaz
> se muestra como "Subactividad". Alternativa (mayor costo/riesgo, fuera de este
> alcance): renombrar la tabla legada. **Decisión por defecto: `SubactividadEjecucion`.**

### 2.1 Cálculo de avance con el nivel 4 (roll-up)

Se replica **exactamente** el patrón que hoy usa el Entregable con sus
Subactividades, un escalón más abajo:

- Hoy: `Entregable.avance = Σ (Subactividad.pesoPorcentaje/100 × Subactividad.avance)`
  (ver `avanceEntregablePonderado` en `backend/src/dominio/calculo-avance.ts` y
  `AvanceService.recalcularActividad`).
- Nuevo: cuando una **Actividad (nivel 3, `Subactividad`)** tiene subactividades
  de ejecución (nivel 4), su avance se **deriva**:
  `Actividad.avance = Σ (SubactividadEjecucion.pesoPorcentaje/100 × SubactividadEjecucion.avance)`.

**Regla del tope de porcentaje (confirmada):** cada `SubactividadEjecucion` se
asigna a un colaborador que **ya es responsable** de la actividad (existe su
`AsignacionSubactividad` con, p. ej., 25 %). El peso de la subactividad es un
porcentaje **absoluto de la actividad** y:

> **La suma de los pesos de las subactividades de un mismo colaborador dentro de
> una actividad no puede superar el ponderado de asignación que ese colaborador
> tiene en la actividad (su 25 %).** Es un presupuesto que se descuenta; el
> sistema rechaza (o pide rebalancear) cualquier alta que lo exceda. No toca el
> presupuesto de los demás responsables.

- El "presupuesto disponible" de un colaborador C en la actividad S =
  `AsignacionSubactividad(C,S).pesoTrabajoPorcentaje − Σ pesos de sus SubactividadEjecucion en S`.
- Al crear/editar una subactividad de nivel 4 se valida `peso ≤ disponible`.
- Reporte de avance del nivel 4: **incremental**, igual que hoy
  (`min(100, vigente + reportado)`), append-only, con autor y fecha/hora
  (RN-05). Tras cada reporte se recalcula la actividad (nivel 3) → el entregable
  (nivel 2) → el componente y el proyecto, con los cálculos ya existentes. **No
  se duplica el motor de avance.**
- Cuando la actividad tiene subactividades de nivel 4, el **reporte directo**
  sobre la actividad queda deshabilitado (mismo criterio que hoy aplica el
  Entregable con sus Subactividades: "su avance se calcula automáticamente").
- **Porción no desglosada** (`100 − Σ pesos` de nivel 4 en la actividad): por
  defecto cuenta como **0 %** hasta desglosarse (hay que crear subactividades
  para "ganar" ese avance). _Punto menor a confirmar:_ alternativa = conservar el
  último reporte directo del colaborador para su porción no desglosada.

---

## 3. Reglas de negocio nuevas (RN-ACTAS)

- **RN-ACTA-01** El acta no empieza vacía: se precarga con proyecto, actividades,
  responsables, el acta anterior y sus pendientes/riesgos abiertos.
- **RN-ACTA-02** Numeración correlativa por proyecto (`Acta 01, 02, …`),
  inmutable una vez enviada.
- **RN-ACTA-03** Estados del acta: `borrador` → `enviada`. Solo `enviada` se
  publica. El envío exige confirmación tras mostrar un resumen.
- **RN-ACTA-04** Solo Administrador crea/edita/envía actas (JWT + RBAC).
- **RN-ACTA-05** Todo elemento creado desde un acta (subactividad, tarea, riesgo)
  conserva la referencia al acta de origen (trazabilidad).
- **RN-ACTA-06** El peso de una subactividad de nivel 4 no supera el presupuesto
  del colaborador en la actividad (sección 2.1).
- **RN-ACTA-07** Los riesgos se registran **por actividad** (nivel 3). Un riesgo
  `abierto` aparece automáticamente en la siguiente acta hasta cerrarse.
- **RN-ACTA-08** Los documentos anexos son privados (nunca públicos), servidos
  solo por endpoint autenticado, reutilizando el modelo de Evidencia (RN-06/13).
- **RN-ACTA-09** Las subactividades y tareas creadas desde el acta son las mismas
  que se consultan/actualizan luego en el seguimiento del proyecto (un solo
  sistema de seguimiento).

---

## 4. Modelo de datos nuevo (Prisma)

Nuevas tablas (nombres `@@map` en snake_case como el resto del esquema). No se
elimina el campo `Subactividad.riesgos` (texto libre) en el primer corte; queda
como dato heredado y se puede migrar luego.

```prisma
// ─── Actas (Fase 15) ────────────────────────────────────────────────

model Acta {
  id            String    @id @default(uuid())
  proyectoId    String    @map("proyecto_id")
  numero        Int       // correlativo por proyecto
  fecha         DateTime
  lugar         String?
  horaInicio    String?   @map("hora_inicio")
  horaFin       String?   @map("hora_fin")
  actividadTema String?   @map("actividad_tema")   // "Actividad o tema" (FO-GINF-102)
  objetivo      String?
  elaboradoPor  String?   @map("elaborado_por")     // texto libre (FO-GINF-102)
  convocadaPor  String?   @map("convocada_por")
  estado        String    @default("borrador")      // borrador | enviada
  enviadaEn     DateTime? @map("enviada_en")
  creadoEn      DateTime  @default(now()) @map("creado_en")
  proyecto      Proyecto  @relation(fields: [proyectoId], references: [id], onDelete: Cascade)

  asistentes    ActaAsistente[]
  temas         ActaTema[]
  conclusiones  ActaConclusion[]
  documentos    ActaDocumento[]
  // elementos creados/originados en esta acta (trazabilidad)
  subactividades SubactividadEjecucion[]
  tareas         Tarea[]
  riesgosOrigen  Riesgo[]  @relation("RiesgoActaOrigen")

  @@unique([proyectoId, numero])
  @@map("acta")
}

// Asistentes al acta: colaboradores del sistema (usuarioId) O invitados
// externos (texto libre, sin cuenta). Uno de los dos por fila.
model ActaAsistente {
  id           String   @id @default(uuid())
  actaId       String   @map("acta_id")
  usuarioId    String?  @map("usuario_id")   // asistente que ES usuario del sistema
  nombre       String?  // requerido si es invitado externo (sin usuarioId)
  organizacion String?  // opcional, para invitados (empresa/entidad)
  rolEnReunion String?  @map("rol_en_reunion") // convocado | invitado | responsable
  esInvitado   Boolean  @default(false) @map("es_invitado")
  acta         Acta     @relation(fields: [actaId], references: [id], onDelete: Cascade)
  usuario      Usuario? @relation(fields: [usuarioId], references: [id])

  @@map("acta_asistente")
}

// Nivel 4: subactividad de ejecución de una Actividad (BD Subactividad).
// Su avance SUMA al de la actividad (roll-up, sección 2.1).
model SubactividadEjecucion {
  id               String       @id @default(uuid())
  subactividadId   String       @map("subactividad_id")   // actividad nivel 3
  actaOrigenId     String?      @map("acta_origen_id")     // acta donde nació
  usuarioId        String       @map("usuario_id")         // responsable (1 colaborador)
  nombre           String
  descripcion      String?
  pesoPorcentaje   Float        @default(0) @map("peso_porcentaje") // % absoluto de la actividad; ≤ presupuesto del colaborador
  fechaCompromiso  DateTime?    @map("fecha_compromiso")
  estado           String       @default("pendiente")      // pendiente | en_ejecucion | finalizada
  avancePorcentaje Float        @default(0) @map("avance_porcentaje") // caché del último avance
  observaciones    String?
  creadoEn         DateTime     @default(now()) @map("creado_en")
  subactividad     Subactividad @relation(fields: [subactividadId], references: [id], onDelete: Cascade)
  actaOrigen       Acta?        @relation(fields: [actaOrigenId], references: [id], onDelete: SetNull)
  usuario          Usuario      @relation(fields: [usuarioId], references: [id])
  avances          AvanceSubactividadEjecucion[]

  @@index([subactividadId, usuarioId])
  @@map("subactividad_ejecucion")
}

// Histórico append-only de avances del nivel 4 (RN-05), igual que AvanceSubactividad.
model AvanceSubactividadEjecucion {
  id                       String                @id @default(uuid())
  subactividadEjecucionId  String                @map("subactividad_ejecucion_id")
  usuarioId                String                @map("usuario_id")
  porcentaje               Float
  enlaceEvidencia          String?               @map("enlace_evidencia")
  observaciones            String?
  fechaHora                DateTime              @default(now()) @map("fecha_hora")
  subactividadEjecucion    SubactividadEjecucion @relation(fields: [subactividadEjecucionId], references: [id], onDelete: Cascade)
  usuario                  Usuario               @relation(fields: [usuarioId], references: [id])

  @@index([subactividadEjecucionId, usuarioId])
  @@map("avance_subactividad_ejecucion")
}

// Tarea / compromiso (action-item). NO pesa en el avance.
model Tarea {
  id              String        @id @default(uuid())
  actaOrigenId    String?       @map("acta_origen_id")
  actividadId     String?       @map("actividad_id")        // entregable (opcional)
  subactividadId  String?       @map("subactividad_id")     // actividad nivel 3 (opcional)
  usuarioId       String?       @map("usuario_id")          // responsable
  descripcion     String
  fechaCompromiso DateTime?     @map("fecha_compromiso")
  prioridad       String        @default("media")           // alta | media | baja
  estado          String        @default("pendiente")       // pendiente | en_progreso | hecha | vencida
  observaciones   String?
  creadoEn        DateTime      @default(now()) @map("creado_en")
  actaOrigen      Acta?         @relation(fields: [actaOrigenId], references: [id], onDelete: SetNull)
  actividad       Actividad?    @relation(fields: [actividadId], references: [id], onDelete: SetNull)
  subactividad    Subactividad? @relation(fields: [subactividadId], references: [id], onDelete: SetNull)
  usuario         Usuario?      @relation(fields: [usuarioId], references: [id])

  @@index([actividadId])
  @@index([subactividadId])
  @@map("tarea")
}

// Riesgo por actividad (nivel 3). Los abiertos se arrastran a la siguiente acta.
model Riesgo {
  id             String        @id @default(uuid())
  subactividadId String        @map("subactividad_id")      // actividad nivel 3
  actaOrigenId   String?       @map("acta_origen_id")
  descripcion    String
  probabilidad   String?       // alta | media | baja
  impacto        String?       // alto | medio | bajo
  nivel          String?       // derivado o manual (alto/medio/bajo)
  estado         String        @default("abierto")          // abierto | mitigado | cerrado
  responsableId  String?       @map("responsable_id")
  mitigacion     String?
  observaciones  String?
  creadoEn       DateTime      @default(now()) @map("creado_en")
  actualizadoEn  DateTime      @default(now()) @updatedAt @map("actualizado_en")
  subactividad   Subactividad  @relation(fields: [subactividadId], references: [id], onDelete: Cascade)
  actaOrigen     Acta?         @relation("RiesgoActaOrigen", fields: [actaOrigenId], references: [id], onDelete: SetNull)
  responsable    Usuario?      @relation(fields: [responsableId], references: [id])
  actualizaciones RiesgoActualizacion[]

  @@index([subactividadId, estado])
  @@map("riesgo")
}

// Histórico de cambios de un riesgo (qué se revisó en cada acta).
model RiesgoActualizacion {
  id          String   @id @default(uuid())
  riesgoId    String   @map("riesgo_id")
  actaId      String?  @map("acta_id")
  estado      String?
  probabilidad String?
  impacto     String?
  nivel       String?
  nota        String?
  fechaHora   DateTime @default(now()) @map("fecha_hora")
  riesgo      Riesgo   @relation(fields: [riesgoId], references: [id], onDelete: Cascade)

  @@index([riesgoId])
  @@map("riesgo_actualizacion")
}

// Desarrollo temático del acta.
model ActaTema {
  id             String        @id @default(uuid())
  actaId         String        @map("acta_id")
  actividadId    String?       @map("actividad_id")   // entregable relacionado (opcional)
  subactividadId String?       @map("subactividad_id")// actividad nivel 3 relacionada (opcional)
  tema           String
  descripcion    String?
  decisiones     String?
  observaciones  String?
  orden          Int           @default(0)
  acta           Acta          @relation(fields: [actaId], references: [id], onDelete: Cascade)

  @@map("acta_tema")
}

model ActaConclusion {
  id       String @id @default(uuid())
  actaId   String @map("acta_id")
  texto    String
  orden    Int    @default(0)
  acta     Acta   @relation(fields: [actaId], references: [id], onDelete: Cascade)

  @@map("acta_conclusion")
}

// Documento anexo — PRIVADO. Reutiliza la infraestructura de Evidencia
// (archivo en volumen, servido solo autenticado). Nunca público.
model ActaDocumento {
  id            String   @id @default(uuid())
  actaId        String   @map("acta_id")
  autorId       String   @map("autor_id")
  tipo          String   // enlace | archivo | documento
  url           String?
  archivoRef    String?  @map("archivo_ref")
  nombreArchivo String?  @map("nombre_archivo")
  mime          String?
  tamanoBytes   Int?     @map("tamano_bytes")
  checksum      String?
  fechaHora     DateTime @default(now()) @map("fecha_hora")
  acta          Acta     @relation(fields: [actaId], references: [id], onDelete: Cascade)

  @@index([actaId])
  @@map("acta_documento")
}
```

Además, agregar los lados inversos de las relaciones en `Proyecto`, `Usuario`,
`Actividad` y `Subactividad` (listas `actas`, `tareas`, `riesgos`,
`subactividadesEjecucion`, `avancesSubactividadEjecucion`, etc.).

Migración: `prisma migrate` nueva (no destructiva; todas las tablas son nuevas y
los campos añadidos a modelos existentes son relaciones inversas). Actualizar
`seed-pac.ts` solo si se quiere sembrar un acta de ejemplo (opcional).

---

## 5. Backend — módulo `actas`

Nuevo módulo NestJS `backend/src/acta/` (más `riesgo/`, `tarea/` y la extensión
de `subactividad/` para el nivel 4), siguiendo el patrón de los módulos actuales
(controller + service + DTOs + guards).

### 5.1 Endpoints privados (Administrador, salvo lo indicado)

Actas:

- `GET  /api/actas` — historial (número, fecha, tema, estado, #tareas, #pendientes).
- `POST /api/actas` — crear borrador; devuelve el acta **precargada** (sección 6).
- `GET  /api/actas/:id` — detalle completo.
- `PATCH /api/actas/:id` — editar borrador (datos generales, temas, conclusiones).
- `POST /api/actas/:id/enviar` — validar + resumen + pasar a `enviada` (inmutable).
- `GET  /api/actas/:id/resumen` — resumen previo al envío (sección 14 del requisito).

Contexto de la nueva acta:

- `GET  /api/actas/nueva/contexto` — arma el borrador: acta anterior, tareas y
  compromisos pendientes, tareas vencidas, riesgos abiertos, actividades que
  requieren seguimiento. Reutiliza los cálculos de estado/desviación/alertas de
  `backend/src/dominio/` y agregados de `cronograma.service.ts` (no duplicar).

Subactividades de ejecución (nivel 4):

- `GET  /api/actividades-op/:subactividadId/ejecuciones` — listar (con presupuesto disponible por colaborador).
- `POST /api/actividades-op/:subactividadId/ejecuciones` — crear (valida RN-ACTA-06). **Admin.**
- `POST /api/ejecuciones/:id/avances` — reportar avance. **Colaborador asignado o Admin** (mismo guard que `SubactividadController`). Recalcula en cascada.
- `GET  /api/ejecuciones/:id/avances` — histórico (asignado o admin).

Tareas:

- `GET/POST /api/tareas`, `PATCH /api/tareas/:id` — crear/actualizar compromisos
  (estado, prioridad, fecha). Visibles en el seguimiento del proyecto.

Riesgos:

- `GET  /api/actividades-op/:subactividadId/riesgos` — riesgos de la actividad.
- `POST /api/actividades-op/:subactividadId/riesgos` — crear. **Admin.**
- `PATCH /api/riesgos/:id` — actualizar estado/probabilidad/impacto/nivel/
  responsable/mitigación (registra `RiesgoActualizacion`). **Admin.**

Documentos anexos (privados):

- `POST /api/actas/:id/documentos` (multipart) — subir anexo. **Admin.**
- `GET  /api/actas/:id/documentos/:docId` — descargar (autenticado). Reutilizar
  el patrón de `EvidenciaModule` (archivo en volumen, nunca público).

### 5.2 Endpoints públicos (solo lectura, actas enviadas)

Bajo el prefijo público existente `@Controller('public/...')`:

- `GET /api/public/actas` — lista de actas **enviadas** (número, fecha, tema, estado).
- `GET /api/public/actas/:id` — detalle público: datos generales, desarrollo
  temático, decisiones, conclusiones, y **resumen** de tareas/subactividades/
  riesgos (sin datos sensibles). **Sin documentos anexos.**

### 5.3 Servicio de recálculo

Extender `AvanceService` (o un servicio hermano) con
`recalcularSubactividad(subactividadId)` que, si la actividad nivel 3 tiene
`SubactividadEjecucion`, deriva su `avancePorcentaje` con el mismo criterio
ponderado. Encadenar: `AvanceSubactividadEjecucion` → recalcular actividad
nivel 3 → `recalcularActividad` (entregable) ya existente. Añadir pruebas en
`calculo-avance.spec.ts` para el tope de presupuesto y el roll-up.

---

## 6. Nueva acta precargada (secciones del formulario)

Al crear el acta, `GET /api/actas/nueva/contexto` entrega el borrador con:

1. **Datos generales** (FO-GINF-102): número (autopropuesto), fecha, lugar, hora
   inicio/fin, actividad o tema, objetivo, elaborado por, convocada por.
   - **Asistentes**: al agregar responsables se seleccionan colaboradores del
     sistema (autocompletado sobre `Usuario`) y, además, se pueden agregar
     **invitados** externos como texto libre (nombre + organización opcional),
     sin necesidad de que tengan cuenta. Cada fila queda como `ActaAsistente`.
2. **Seguimiento del acta anterior** (sección 5 del requisito): tareas y
   compromisos pendientes, tareas vencidas, riesgos abiertos, actividades que
   requieren seguimiento, decisiones pendientes. Por elemento: descripción,
   actividad relacionada, responsable, fecha de compromiso, estado anterior,
   observaciones — todos editables desde la nueva acta.
3. **Seleccionar actividad** → lista de actividades (nivel 3) existentes; al
   elegir una: responsable(s), estado, avance, fechas, subactividades de nivel 4
   existentes, tareas y riesgos relacionados.
4. **+ Crear subactividad** (nivel 4) dentro de la actividad, con validación de
   presupuesto por colaborador.
5. **+ Crear tarea** (compromiso) sobre actividad/subactividad.
6. **Riesgos**: ver/crear/actualizar por actividad.
7. **Desarrollo de la reunión** (temas), **Conclusiones**, **Documentos anexos**.
8. **Guardar borrador** / **Enviar** (con resumen y confirmación).

---

## 7. Frontend

### 7.1 Privado (Administrador)

- Nueva entrada en `frontend/src/privado/Layout.tsx` (bloque `esAdmin`):
  `Gestión de Actas` → `/app/admin/actas`.
- Rutas nuevas en `main.tsx` bajo `/app`:
  - `admin/actas` → listado (Historial de actas).
  - `admin/actas/nueva` → asistente de nueva acta (secciones de la sección 6).
  - `admin/actas/:id` → detalle/edición del acta.
- Reutilizar componentes existentes: `Modal`, `Dialogo`, `EstadoBadge`,
  `BarraAvance`, `ToastProvider`, `EstadoVacio`, y los helpers de `api.ts`/`tipos.ts`.

### 7.2 Colaborador (integración con "Mis actividades")

Las subactividades de nivel 4 asignadas al colaborador aparecen en su flujo
normal (`MisActividades.tsx` / `DetalleActividad.tsx`) para reportar avance —
**no** hay un segundo lugar de reporte. El reporte suma a la actividad (roll-up).

### 7.3 Público

- Nueva pestaña en `frontend/src/App.tsx` (el dashboard público) — p. ej.
  **"Actas"** junto a "Ejecutar Plan / Resumen / Cronograma / Actividades /
  Alertas" — que consume `GET /api/public/actas`. Lista + vista de detalle de
  cada acta enviada (solo lectura, sin anexos).

---

## 8. Trazabilidad y auditoría

- Cada `SubactividadEjecucion`, `Tarea` y `Riesgo` guarda `actaOrigenId`.
- Registrar en `EventoAuditoria` (append-only ya existente) las acciones
  `crear/editar` de acta, envío de acta, y alta de subactividad/tarea/riesgo, con
  `entidadTipo`/`entidadId`. No crear auditoría nueva.
- La vista de detalle de una actividad/entregable en el seguimiento debe mostrar,
  por cada elemento, el acta donde se creó, responsable, fecha de compromiso,
  estado y última actualización (sección 17 del requisito).

---

## 9. Formato FO-GINF-102

El asistente y la vista de detalle mapean 1:1 los bloques del formato: datos
generales, agenda/temas, desarrollo temático, conclusiones, documentos anexos,
tareas asignadas (responsable + fecha de compromiso) y próxima reunión.
Entregable adicional deseable: **exportar/imprimir el acta** en el layout del
formato (PDF o vista imprimible) — se puede posponer a un corte posterior.

> Pendiente operativo: adjuntar el archivo `FO-GINF-102 Acta de Reunión General`
> al repo (`docs/fase-15-actas/`) como referencia. No se encontró en el árbol
> actual.

---

## 10. Plan de implementación incremental

1. **Datos**: modelos Prisma + migración + relaciones inversas. Pruebas de
   esquema y de recálculo (tope de presupuesto y roll-up en `calculo-avance`).
2. **Backend nivel 4**: `SubactividadEjecucion` + avances + `recalcularSubactividad`
   encadenado. Integración en "Mis actividades".
3. **Backend actas**: módulo `acta` (CRUD, contexto precargado, enviar/resumen) +
   `tarea` + `riesgo` + documentos anexos (reusando Evidencia).
4. **Backend público**: endpoints `/api/public/actas`.
5. **Frontend privado**: listado, asistente de nueva acta, detalle/edición.
6. **Frontend público**: pestaña "Actas".
7. **Trazabilidad/auditoría** y export FO-GINF-102 (opcional).
8. Pruebas e2e del flujo completo (sección 18 del requisito) y actualización de
   `docs/fase-1-arquitectura/02-modelo-datos.md`, `03-api-preliminar.md`,
   `04-matriz-roles-permisos.md`, `06-trazabilidad-requisitos.md` y `README.md`.

---

## 11. Puntos menores por confirmar (no bloquean el arranque)

1. **Nombre del nivel 4**: `SubactividadEjecucion` (por defecto) vs. renombrar la
   tabla legada `Subactividad`.
2. **Porción no desglosada** de una actividad: cuenta 0 % (por defecto) vs.
   conservar el último reporte directo del colaborador.
3. **Riesgo → nivel**: derivado de probabilidad×impacto (matriz) vs. manual.
4. **Export FO-GINF-102**: incluir impresión/PDF en este alcance o posponer.
5. Adjuntar el formato `FO-GINF-102` de referencia al repositorio.
