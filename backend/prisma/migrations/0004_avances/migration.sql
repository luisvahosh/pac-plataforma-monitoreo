-- CreateTable
CREATE TABLE "asignacion" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "peso_trabajo_porcentaje" DOUBLE PRECISION NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avance" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asignacion_actividad_id_usuario_id_key" ON "asignacion"("actividad_id", "usuario_id");

-- CreateIndex
CREATE INDEX "avance_actividad_id_usuario_id_idx" ON "avance"("actividad_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "asignacion" ADD CONSTRAINT "asignacion_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion" ADD CONSTRAINT "asignacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance" ADD CONSTRAINT "avance_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance" ADD CONSTRAINT "avance_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Refuerzo de invariantes (RN-02, RN-08): rangos 0..100.
ALTER TABLE "avance" ADD CONSTRAINT "avance_porcentaje_rango" CHECK ("porcentaje" >= 0 AND "porcentaje" <= 100);
ALTER TABLE "asignacion" ADD CONSTRAINT "asignacion_peso_rango" CHECK ("peso_trabajo_porcentaje" >= 0 AND "peso_trabajo_porcentaje" <= 100);
