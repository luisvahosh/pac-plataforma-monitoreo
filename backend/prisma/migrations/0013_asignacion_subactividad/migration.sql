-- CreateTable
CREATE TABLE "asignacion_subactividad" (
    "id" TEXT NOT NULL,
    "subactividad_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "peso_trabajo_porcentaje" DOUBLE PRECISION NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignacion_subactividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asignacion_subactividad_subactividad_id_usuario_id_key" ON "asignacion_subactividad"("subactividad_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "asignacion_subactividad" ADD CONSTRAINT "asignacion_subactividad_subactividad_id_fkey" FOREIGN KEY ("subactividad_id") REFERENCES "subactividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_subactividad" ADD CONSTRAINT "asignacion_subactividad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
