-- DropForeignKey
ALTER TABLE "nota" DROP CONSTRAINT IF EXISTS "nota_actividad_id_fkey";
ALTER TABLE "nota" DROP CONSTRAINT IF EXISTS "nota_autor_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "nota";
