/*
  Warnings:

  - Made the column `measure_value` on table `measures` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "measures" ALTER COLUMN "measure_value" SET NOT NULL;
