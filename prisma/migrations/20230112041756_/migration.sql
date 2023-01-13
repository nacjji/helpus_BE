-- CreateTable
CREATE TABLE `Alarm` (
    `alarmId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `eventType` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `checked` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`alarmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`postId`) ON DELETE RESTRICT ON UPDATE CASCADE;
