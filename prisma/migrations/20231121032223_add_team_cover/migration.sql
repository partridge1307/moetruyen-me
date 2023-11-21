-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "cover" TEXT,
ADD COLUMN     "plainTextDescription" TEXT NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL;
