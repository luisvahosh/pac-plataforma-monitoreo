-- AlterTable
-- Riesgos asociados a la Actividad (tabla subactividad), texto libre. Nullable:
-- no afecta filas existentes. Registro solo autenticado; lectura pública.
ALTER TABLE "subactividad" ADD COLUMN "riesgos" TEXT;
