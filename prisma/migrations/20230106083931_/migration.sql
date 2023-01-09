/*
  Warnings:

  - The primary key for the `Score` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Score` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ScoreToUser` DROP FOREIGN KEY `_ScoreToUser_A_fkey`;

-- AlterTable
ALTER TABLE `Score` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `userId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`userId`);

-- AddForeignKey
ALTER TABLE `_ScoreToUser` ADD CONSTRAINT `_ScoreToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Score`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
