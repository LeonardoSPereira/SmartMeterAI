/*
  Warnings:

  - You are about to drop the `Measure` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Measure";

-- CreateTable
CREATE TABLE "measures" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "measureType" "MeasureType" NOT NULL,
    "measureValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measures_pkey" PRIMARY KEY ("id")
);
