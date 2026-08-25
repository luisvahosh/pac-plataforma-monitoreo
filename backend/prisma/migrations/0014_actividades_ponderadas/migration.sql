-- Actividades (Subactividades de la BD) con peso, etapa, fechas y criterio;
-- el avance del Entregable pasa a derivarse como SUMA PONDERADA por ese peso.
-- Además: distribución de responsabilidad por Componente (asignacion_componente).

-- AlterTable: nuevos campos de la Subactividad
ALTER TABLE "subactividad" ADD COLUMN "codigo" TEXT;
ALTER TABLE "subactividad" ADD COLUMN "etapa" TEXT;
ALTER TABLE "subactividad" ADD COLUMN "peso_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "subactividad" ADD COLUMN "fecha_inicio_plan" TIMESTAMP(3);
ALTER TABLE "subactividad" ADD COLUMN "fecha_fin_plan" TIMESTAMP(3);
ALTER TABLE "subactividad" ADD COLUMN "criterio_terminado" TEXT;
ALTER TABLE "subactividad" ADD COLUMN "nota" TEXT;

-- CreateTable: distribución de responsabilidad por Componente (suma 100 % por Fase)
CREATE TABLE "asignacion_componente" (
    "id" TEXT NOT NULL,
    "fase_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "peso_porcentaje" DOUBLE PRECISION NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignacion_componente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asignacion_componente_fase_id_usuario_id_key" ON "asignacion_componente"("fase_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "asignacion_componente" ADD CONSTRAINT "asignacion_componente_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_componente" ADD CONSTRAINT "asignacion_componente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
