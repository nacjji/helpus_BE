-- CreateTable
CREATE TABLE `SocketTable` (
    `socketId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`socketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SocketTable` ADD CONSTRAINT `SocketTable_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
