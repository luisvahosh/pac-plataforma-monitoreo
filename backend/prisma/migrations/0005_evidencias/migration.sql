-- CreateTable
CREATE TABLE "evidencia" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "avance_id" TEXT,
    "autor_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT,
    "archivo_ref" TEXT,
    "nombre_archivo" TEXT,
    "mime" TEXT,
    "tamano_bytes" INTEGER,
    "checksum" TEXT,
    "observacion" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidencia_actividad_id_idx" ON "evidencia"("actividad_id");

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_avance_id_fkey" FOREIGN KEY ("avance_id") REFERENCES "avance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
