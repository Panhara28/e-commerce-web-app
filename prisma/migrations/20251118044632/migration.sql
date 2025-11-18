/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customers` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `customers_username_key` ON `customers`(`username`);
