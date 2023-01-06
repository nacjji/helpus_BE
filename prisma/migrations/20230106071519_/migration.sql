/*
  Warnings:

  - You are about to drop the column `userId` on the `Score` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Score` DROP FOREIGN KEY `Score_userId_fkey`;

-- AlterTable
ALTER TABLE `Score` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `_ScoreToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ScoreToUser_AB_unique`(`A`, `B`),
    INDEX `_ScoreToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ScoreToUser` ADD CONSTRAINT `_ScoreToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Score`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScoreToUser` ADD CONSTRAINT `_ScoreToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
