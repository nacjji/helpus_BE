/*
  Warnings:

  - You are about to drop the column `imageUrl1` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl2` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl3` on the `Post` table. All the data in the column will be lost.
  - Added the required column `userId` to the `PostImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` DROP COLUMN `imageUrl1`,
    DROP COLUMN `imageUrl2`,
    DROP COLUMN `imageUrl3`;

-- AlterTable
ALTER TABLE `PostImages` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Room` ADD COLUMN `state` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `PostImages` ADD CONSTRAINT `PostImages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
