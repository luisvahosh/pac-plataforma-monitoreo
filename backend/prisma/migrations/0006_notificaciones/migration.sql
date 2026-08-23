-- CreateTable
CREATE TABLE "regla_alerta" (
    "id" TEXT NOT NULL,
    "ambito" TEXT NOT NULL DEFAULT 'global',
    "dias_anticipacion" INTEGER[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regla_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion_enviada" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuario_id" TEXT,
    "entidad_tipo" TEXT,
    "entidad_id" TEXT,
    "umbral_dias" INTEGER,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_enviada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificacion_enviada_tipo_entidad_id_usuario_id_idx" ON "notificacion_enviada"("tipo", "entidad_id", "usuario_id");

-- Semilla: regla de alerta global por defecto (7, 3 y 1 días).
INSERT INTO "regla_alerta" ("id", "ambito", "dias_anticipacion", "activo")
VALUES (gen_random_uuid(), 'global', ARRAY[7, 3, 1], true);
