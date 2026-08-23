-- CreateTable
CREATE TABLE "subactividad" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "avance_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "subactividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avance_subactividad" (
    "id" TEXT NOT NULL,
    "subactividad_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "enlace_evidencia" TEXT,
    "observaciones" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avance_subactividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avance_subactividad_subactividad_id_usuario_id_idx" ON "avance_subactividad"("subactividad_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "subactividad" ADD CONSTRAINT "subactividad_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_subactividad" ADD CONSTRAINT "avance_subactividad_subactividad_id_fkey" FOREIGN KEY ("subactividad_id") REFERENCES "subactividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_subactividad" ADD CONSTRAINT "avance_subactividad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateCheck
ALTER TABLE "avance_subactividad" ADD CONSTRAINT "avance_subactividad_porcentaje_rango" CHECK ("porcentaje" >= 0 AND "porcentaje" <= 100);
