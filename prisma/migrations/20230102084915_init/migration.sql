-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `state1` VARCHAR(191) NULL,
    `state2` VARCHAR(191) NULL,
    `userImage` VARCHAR(191) NULL,
    `kakao` BIGINT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_kakao_key`(`kakao`),
    UNIQUE INDEX `User_userId_userName_key`(`userId`, `userName`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `postId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `category` INTEGER NOT NULL,
    `appointed` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDeadLine` INTEGER NULL DEFAULT 0,
    `location1` VARCHAR(191) NULL,
    `location2` VARCHAR(191) NULL,
    `imageUrl1` VARCHAR(191) NULL,
    `imageUrl2` VARCHAR(191) NULL,
    `imageUrl3` VARCHAR(191) NULL,
    `tag` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wish` (
    `postId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`postId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_userId_userName_fkey` FOREIGN KEY (`userId`, `userName`) REFERENCES `User`(`userId`, `userName`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wish` ADD CONSTRAINT `Wish_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`postId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wish` ADD CONSTRAINT `Wish_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
