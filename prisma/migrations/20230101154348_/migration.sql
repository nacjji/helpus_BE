/*
  Warnings:

  - The primary key for the `Friend` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userA` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `userB` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.
  - The primary key for the `Wish` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Wish` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[replyCommentId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kakao]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comment` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestFriend` to the `Friend` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Friend` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Friend` DROP FOREIGN KEY `Friend_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Wish` DROP FOREIGN KEY `Wish_postId_fkey`;

-- DropForeignKey
ALTER TABLE `Wish` DROP FOREIGN KEY `Wish_userId_fkey`;

-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `comment` VARCHAR(191) NOT NULL,
    ADD COLUMN `replyCommentId` INTEGER NULL,
    MODIFY `updated` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Friend` DROP PRIMARY KEY,
    DROP COLUMN `userA`,
    DROP COLUMN `userB`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `requestFriend` INTEGER NOT NULL,
    MODIFY `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `imageUrl`,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl1` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl2` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl3` VARCHAR(191) NULL,
    ADD COLUMN `tag` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    MODIFY `updated` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `User` ADD COLUMN `kakao` BIGINT NULL;

-- AlterTable
ALTER TABLE `Wish` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`postId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Comment_replyCommentId_key` ON `Comment`(`replyCommentId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `User_kakao_key` ON `User`(`kakao`);

-- AddForeignKey
ALTER TABLE `Friend` ADD CONSTRAINT `Friend_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_replyCommentId_fkey` FOREIGN KEY (`replyCommentId`) REFERENCES `Comment`(`commentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wish` ADD CONSTRAINT `Wish_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`postId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wish` ADD CONSTRAINT `Wish_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
