/*
  Warnings:

  - You are about to drop the `Case` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_userId_fkey";

-- DropTable
DROP TABLE "Case";
