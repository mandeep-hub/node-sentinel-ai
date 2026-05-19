/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Case` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Case` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(38,18)`.
  - You are about to drop the column `country` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `cryptoAmount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `cryptoType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `fiatAmount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `Transaction` table. All the data in the column will be lost.
  - Made the column `reason` on table `Case` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `kind` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" DROP COLUMN "updatedAt",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(38,18),
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "country",
DROP COLUMN "cryptoAmount",
DROP COLUMN "cryptoType",
DROP COLUMN "currency",
DROP COLUMN "fiatAmount",
DROP COLUMN "transactionType",
ADD COLUMN     "creditAmount" DECIMAL(38,18),
ADD COLUMN     "creditCurrencyCode" TEXT,
ADD COLUMN     "debitAmount" DECIMAL(38,18),
ADD COLUMN     "debitCurrencyCode" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "userId" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "amount" DECIMAL(38,18) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("userId","currencyCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creditCurrencyCode_fkey" FOREIGN KEY ("creditCurrencyCode") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_debitCurrencyCode_fkey" FOREIGN KEY ("debitCurrencyCode") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
