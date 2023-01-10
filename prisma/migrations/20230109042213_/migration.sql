/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `chatId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chat` DROP PRIMARY KEY,
    ADD COLUMN `chatId` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `roomId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`chatId`);
