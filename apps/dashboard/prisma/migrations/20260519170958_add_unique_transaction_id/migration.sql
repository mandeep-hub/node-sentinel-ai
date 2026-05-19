/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Case` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Case_transactionId_key" ON "Case"("transactionId");
