/*
  Warnings:

  - You are about to drop the column `blurImages` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `History` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "blurImages";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "chapterId";
