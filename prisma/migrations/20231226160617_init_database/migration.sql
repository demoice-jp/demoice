-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(21) NOT NULL,
    `user_name` VARCHAR(36) NOT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `birth_date` DATE NOT NULL,
    `prefecture` CHAR(2) NOT NULL,
    `created_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted` BOOLEAN NOT NULL,

    UNIQUE INDEX `users_user_name_key`(`user_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_ids` (
    `provider` ENUM('line') NOT NULL,
    `provider_id` VARCHAR(255) NOT NULL,
    `user_id` CHAR(21) NOT NULL,

    INDEX `provider_ids_user_id_idx`(`user_id`),
    PRIMARY KEY (`provider`, `provider_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contents` (
    `id` CHAR(21) NOT NULL,
    `author_id` CHAR(21) NOT NULL,
    `title` VARCHAR(60) NULL,
    `content` MEDIUMTEXT NULL,
    `content_html` MEDIUMTEXT NULL,
    `content_string` MEDIUMTEXT NULL,
    `image` JSON NULL,
    `created_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `commit_date` TIMESTAMP(0) NULL,

    INDEX `contents_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policies` (
    `id` CHAR(21) NOT NULL,
    `content_id` CHAR(21) NOT NULL,
    `created_date` TIMESTAMP(0) NOT NULL,
    `updated_date` TIMESTAMP(0) NOT NULL,
    `vote_positive` INTEGER NOT NULL DEFAULT 0,
    `vote_negative` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `policies_content_id_key`(`content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policy_versions` (
    `policy_id` CHAR(21) NOT NULL,
    `version` INTEGER NOT NULL,
    `content_id` CHAR(21) NOT NULL,

    UNIQUE INDEX `policy_versions_content_id_key`(`content_id`),
    PRIMARY KEY (`policy_id`, `version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policy_votes` (
    `voter_id` CHAR(21) NOT NULL,
    `policy_id` CHAR(21) NOT NULL,
    `vote` ENUM('positive', 'negative') NOT NULL,

    INDEX `policy_votes_policy_id_idx`(`policy_id`),
    PRIMARY KEY (`voter_id`, `policy_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `provider_ids` ADD CONSTRAINT `provider_ids_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contents` ADD CONSTRAINT `contents_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policies` ADD CONSTRAINT `policies_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy_versions` ADD CONSTRAINT `policy_versions_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy_versions` ADD CONSTRAINT `policy_versions_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy_votes` ADD CONSTRAINT `policy_votes_voter_id_fkey` FOREIGN KEY (`voter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy_votes` ADD CONSTRAINT `policy_votes_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
