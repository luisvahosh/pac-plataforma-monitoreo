-- CreateTable
CREATE TABLE "nota" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT,
    "autor_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nota_actividad_id_idx" ON "nota"("actividad_id");

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
