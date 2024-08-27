/*
  Warnings:

  - You are about to drop the column `measureValue` on the `measures` table. All the data in the column will be lost.
  - Added the required column `image_url` to the `measures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "measures" DROP COLUMN "measureValue",
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "measure_value" INTEGER;
