-- Gestión de Actas (Fase 15). Todas las tablas son nuevas; no altera datos
-- existentes. Ver docs/fase-15-actas/00-plan-gestion-actas.md.
-- Nivel 4 = "Tarea" (apoya el desarrollo de una Actividad; opcional).

-- CreateTable
CREATE TABLE "acta" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "hora_inicio" TEXT,
    "hora_fin" TEXT,
    "actividad_tema" TEXT,
    "objetivo" TEXT,
    "elaborado_por" TEXT,
    "convocada_por" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "enviada_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acta_asistente" (
    "id" TEXT NOT NULL,
    "acta_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "nombre" TEXT,
    "organizacion" TEXT,
    "rol_en_reunion" TEXT,
    "es_invitado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "acta_asistente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarea" (
    "id" TEXT NOT NULL,
    "subactividad_id" TEXT NOT NULL,
    "acta_origen_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "peso_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha_compromiso" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "avance_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avance_tarea" (
    "id" TEXT NOT NULL,
    "tarea_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "enlace_evidencia" TEXT,
    "observaciones" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avance_tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riesgo" (
    "id" TEXT NOT NULL,
    "subactividad_id" TEXT NOT NULL,
    "acta_origen_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "probabilidad" TEXT,
    "impacto" TEXT,
    "nivel" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "responsable_id" TEXT,
    "mitigacion" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riesgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riesgo_actualizacion" (
    "id" TEXT NOT NULL,
    "riesgo_id" TEXT NOT NULL,
    "acta_id" TEXT,
    "estado" TEXT,
    "probabilidad" TEXT,
    "impacto" TEXT,
    "nivel" TEXT,
    "nota" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riesgo_actualizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acta_tema" (
    "id" TEXT NOT NULL,
    "acta_id" TEXT NOT NULL,
    "actividad_id" TEXT,
    "subactividad_id" TEXT,
    "tema" TEXT NOT NULL,
    "descripcion" TEXT,
    "decisiones" TEXT,
    "observaciones" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "acta_tema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acta_conclusion" (
    "id" TEXT NOT NULL,
    "acta_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "acta_conclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acta_documento" (
    "id" TEXT NOT NULL,
    "acta_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT,
    "archivo_ref" TEXT,
    "nombre_archivo" TEXT,
    "mime" TEXT,
    "tamano_bytes" INTEGER,
    "checksum" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acta_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "acta_proyecto_id_numero_key" ON "acta"("proyecto_id", "numero");

-- CreateIndex
CREATE INDEX "acta_asistente_acta_id_idx" ON "acta_asistente"("acta_id");

-- CreateIndex
CREATE INDEX "tarea_subactividad_id_usuario_id_idx" ON "tarea"("subactividad_id", "usuario_id");

-- CreateIndex
CREATE INDEX "avance_tarea_tarea_id_usuario_id_idx" ON "avance_tarea"("tarea_id", "usuario_id");

-- CreateIndex
CREATE INDEX "riesgo_subactividad_id_estado_idx" ON "riesgo"("subactividad_id", "estado");

-- CreateIndex
CREATE INDEX "riesgo_actualizacion_riesgo_id_idx" ON "riesgo_actualizacion"("riesgo_id");

-- CreateIndex
CREATE INDEX "acta_tema_acta_id_idx" ON "acta_tema"("acta_id");

-- CreateIndex
CREATE INDEX "acta_conclusion_acta_id_idx" ON "acta_conclusion"("acta_id");

-- CreateIndex
CREATE INDEX "acta_documento_acta_id_idx" ON "acta_documento"("acta_id");

-- AddForeignKey
ALTER TABLE "acta" ADD CONSTRAINT "acta_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_asistente" ADD CONSTRAINT "acta_asistente_acta_id_fkey" FOREIGN KEY ("acta_id") REFERENCES "acta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_asistente" ADD CONSTRAINT "acta_asistente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_subactividad_id_fkey" FOREIGN KEY ("subactividad_id") REFERENCES "subactividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_acta_origen_id_fkey" FOREIGN KEY ("acta_origen_id") REFERENCES "acta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_tarea" ADD CONSTRAINT "avance_tarea_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_tarea" ADD CONSTRAINT "avance_tarea_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgo" ADD CONSTRAINT "riesgo_subactividad_id_fkey" FOREIGN KEY ("subactividad_id") REFERENCES "subactividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgo" ADD CONSTRAINT "riesgo_acta_origen_id_fkey" FOREIGN KEY ("acta_origen_id") REFERENCES "acta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgo" ADD CONSTRAINT "riesgo_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgo_actualizacion" ADD CONSTRAINT "riesgo_actualizacion_riesgo_id_fkey" FOREIGN KEY ("riesgo_id") REFERENCES "riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_tema" ADD CONSTRAINT "acta_tema_acta_id_fkey" FOREIGN KEY ("acta_id") REFERENCES "acta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_conclusion" ADD CONSTRAINT "acta_conclusion_acta_id_fkey" FOREIGN KEY ("acta_id") REFERENCES "acta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_documento" ADD CONSTRAINT "acta_documento_acta_id_fkey" FOREIGN KEY ("acta_id") REFERENCES "acta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta_documento" ADD CONSTRAINT "acta_documento_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
