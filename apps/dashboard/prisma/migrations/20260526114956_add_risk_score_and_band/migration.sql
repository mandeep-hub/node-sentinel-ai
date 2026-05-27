-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "riskBand" TEXT DEFAULT 'LOW',
ADD COLUMN     "riskScore" INTEGER DEFAULT 0;
