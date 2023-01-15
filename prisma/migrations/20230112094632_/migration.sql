/*
  Warnings:

  - The primary key for the `Alarm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alarmId` on the `Alarm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Alarm` DROP PRIMARY KEY,
    DROP COLUMN `alarmId`,
    ADD PRIMARY KEY (`postId`, `ownerId`, `senderId`);
