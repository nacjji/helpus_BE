/*
  Warnings:

  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `state`,
    ADD COLUMN `state1` VARCHAR(191) NULL,
    ADD COLUMN `state2` VARCHAR(191) NULL;
