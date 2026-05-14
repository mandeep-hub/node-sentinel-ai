-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "conversionConvertedAmount" DOUBLE PRECISION,
ADD COLUMN     "conversionFrom" TEXT,
ADD COLUMN     "conversionOriginalAmount" DOUBLE PRECISION,
ADD COLUMN     "conversionTo" TEXT;
