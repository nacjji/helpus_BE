/*
  Warnings:

  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `tokenId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Token` DROP PRIMARY KEY,
    ADD COLUMN `tokenId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`tokenId`);
