-- CreateTable
CREATE TABLE "proyecto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "objetivos" TEXT,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fase" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "peso_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividad" (
    "id" TEXT NOT NULL,
    "fase_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio_plan" TIMESTAMP(3),
    "fecha_fin_plan" TIMESTAMP(3),
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "avance_porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hito" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_objetivo" TIMESTAMP(3),
    "cumplido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_linea_base" (
    "id" TEXT NOT NULL,
    "entidad_tipo" TEXT NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "fecha_original" TIMESTAMP(3),
    "fecha_nueva" TIMESTAMP(3),
    "usuario_id" TEXT,
    "justificacion" TEXT NOT NULL,
    "fecha_hora_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambio_linea_base_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cambio_linea_base_entidad_tipo_entidad_id_idx" ON "cambio_linea_base"("entidad_tipo", "entidad_id");

-- AddForeignKey
ALTER TABLE "fase" ADD CONSTRAINT "fase_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hito" ADD CONSTRAINT "hito_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Refuerzo de invariantes (RN-02): rango de porcentajes 0..100.
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_avance_rango" CHECK ("avance_porcentaje" >= 0 AND "avance_porcentaje" <= 100);
ALTER TABLE "fase" ADD CONSTRAINT "fase_peso_rango" CHECK ("peso_porcentaje" >= 0 AND "peso_porcentaje" <= 100);
