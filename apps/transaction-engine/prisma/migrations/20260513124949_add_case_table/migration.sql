-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseId_key" ON "Case"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_transactionId_key" ON "Case"("transactionId");
