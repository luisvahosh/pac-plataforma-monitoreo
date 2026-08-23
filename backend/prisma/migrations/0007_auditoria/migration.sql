-- CreateTable
CREATE TABLE "evento_auditoria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "entidad_tipo" TEXT,
    "entidad_id" TEXT,
    "detalle" JSONB,
    "ip" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evento_auditoria_usuario_id_idx" ON "evento_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "evento_auditoria_entidad_tipo_entidad_id_idx" ON "evento_auditoria"("entidad_tipo", "entidad_id");

-- CreateIndex
CREATE INDEX "evento_auditoria_fecha_hora_idx" ON "evento_auditoria"("fecha_hora");
