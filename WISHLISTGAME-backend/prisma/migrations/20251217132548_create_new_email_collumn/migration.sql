-- CreateEnum
CREATE TYPE "WishlistStatus" AS ENUM ('PENDING', 'PURCHASED', 'REMOVED');

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
