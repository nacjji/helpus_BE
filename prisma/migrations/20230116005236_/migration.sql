/*
  Warnings:

  - Made the column `userImage` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `userImage` VARCHAR(191) NOT NULL;
