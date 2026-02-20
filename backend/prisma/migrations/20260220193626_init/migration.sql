-- DropIndex
DROP INDEX `employees_employer_id_fkey` ON `employees`;

-- DropIndex
DROP INDEX `housing_house_type_id_fkey` ON `housing`;

-- DropIndex
DROP INDEX `registrations_housing_id_fkey` ON `registrations`;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_employer_id_fkey` FOREIGN KEY (`employer_id`) REFERENCES `employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `housing` ADD CONSTRAINT `housing_house_type_id_fkey` FOREIGN KEY (`house_type_id`) REFERENCES `house_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_housing_id_fkey` FOREIGN KEY (`housing_id`) REFERENCES `housing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
