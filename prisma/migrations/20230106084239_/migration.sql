/*
  Warnings:

  - The primary key for the `Score` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_ScoreToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ScoreToUser` DROP FOREIGN KEY `_ScoreToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ScoreToUser` DROP FOREIGN KEY `_ScoreToUser_B_fkey`;

-- AlterTable
ALTER TABLE `Score` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `_ScoreToUser`;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
