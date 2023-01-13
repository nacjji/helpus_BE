/*
  Warnings:

  - You are about to drop the column `checked` on the `Alarm` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `Alarm` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Alarm` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Alarm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Alarm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Alarm` DROP FOREIGN KEY `Alarm_userId_fkey`;

-- AlterTable
ALTER TABLE `Alarm` DROP COLUMN `checked`,
    DROP COLUMN `eventType`,
    DROP COLUMN `userId`,
    ADD COLUMN `count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `ownerId` INTEGER NOT NULL,
    ADD COLUMN `senderId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `isRead` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
