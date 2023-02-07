/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `Alarm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Score` DROP FOREIGN KEY `Score_userId_fkey`;

-- AlterTable
ALTER TABLE `Alarm` ADD COLUMN `roomId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `score_total` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `Score`;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE CASCADE ON UPDATE CASCADE;
