/*
  Warnings:

  - Made the column `score` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `score` DOUBLE NOT NULL DEFAULT 5.0;
