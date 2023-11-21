/*
  Warnings:

  - Added the required column `plainTextDescription` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `description` on the `Team` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "cover" TEXT,
ADD COLUMN     "plainTextDescription" TEXT NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL;
