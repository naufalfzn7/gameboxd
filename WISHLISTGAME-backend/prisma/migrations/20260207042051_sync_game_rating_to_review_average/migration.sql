/*
  Warnings:

  - You are about to drop the column `content` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "content";
