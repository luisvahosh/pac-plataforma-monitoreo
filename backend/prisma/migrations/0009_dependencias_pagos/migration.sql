-- AlterTable
ALTER TABLE "actividad" ADD COLUMN "tramo_pago" TEXT;
ALTER TABLE "actividad" ADD COLUMN "tramo_pago_porcentaje" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "dependencia_actividad" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "depende_de_id" TEXT NOT NULL,

    CONSTRAINT "dependencia_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dependencia_actividad_actividad_id_depende_de_id_key" ON "dependencia_actividad"("actividad_id", "depende_de_id");

-- AddForeignKey
ALTER TABLE "dependencia_actividad" ADD CONSTRAINT "dependencia_actividad_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencia_actividad" ADD CONSTRAINT "dependencia_actividad_depende_de_id_fkey" FOREIGN KEY ("depende_de_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
