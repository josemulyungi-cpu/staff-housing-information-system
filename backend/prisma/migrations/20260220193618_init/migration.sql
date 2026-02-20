-- CreateTable
CREATE TABLE `employer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employer_id` VARCHAR(191) NOT NULL,
    `employer_name` VARCHAR(191) NOT NULL,
    `authorized` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `employer_employer_id_key`(`employer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `year_of_employment` INTEGER NOT NULL,
    `employer_id` INTEGER NOT NULL,

    UNIQUE INDEX `employees_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `house_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `house_type_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `house_type_house_type_name_key`(`house_type_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `housing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `region` VARCHAR(191) NOT NULL DEFAULT 'Nairobi',
    `county` VARCHAR(191) NOT NULL,
    `town_location` VARCHAR(191) NOT NULL,
    `block_name` VARCHAR(191) NOT NULL,
    `floor_number` INTEGER NOT NULL,
    `house_type_id` INTEGER NOT NULL,
    `monthly_rent` DECIMAL(65, 30) NOT NULL,
    `payment_duration_months` INTEGER NOT NULL,
    `occupancy_status` VARCHAR(191) NOT NULL DEFAULT 'vacant',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `housing_id` INTEGER NOT NULL,
    `application_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `registrations_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_employer_id_fkey` FOREIGN KEY (`employer_id`) REFERENCES `employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `housing` ADD CONSTRAINT `housing_house_type_id_fkey` FOREIGN KEY (`house_type_id`) REFERENCES `house_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_housing_id_fkey` FOREIGN KEY (`housing_id`) REFERENCES `housing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
