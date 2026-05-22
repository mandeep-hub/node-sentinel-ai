-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedEmail" TEXT,
ADD COLUMN     "assignedTo" TEXT,
ALTER COLUMN "status" SET DEFAULT 'open';
