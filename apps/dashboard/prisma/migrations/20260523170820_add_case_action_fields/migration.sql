-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "autoAssignOnResolve" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "messageSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messageSentAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

