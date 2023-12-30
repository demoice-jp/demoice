-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar` CHAR(21) NULL;

-- CreateTable
CREATE TABLE `comments` (
    `id` CHAR(21) NOT NULL,
    `parentType` ENUM('policy') NOT NULL,
    `parent_id` CHAR(21) NOT NULL,
    `authorId` CHAR(21) NOT NULL,
    `posted_date` TIMESTAMP(0) NOT NULL,
    `content` TEXT NOT NULL,

    INDEX `comments_parentType_parent_id_posted_date_idx`(`parentType`, `parent_id`, `posted_date` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
