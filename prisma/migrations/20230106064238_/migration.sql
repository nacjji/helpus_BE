-- CreateTable
CREATE TABLE `Score` (
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
