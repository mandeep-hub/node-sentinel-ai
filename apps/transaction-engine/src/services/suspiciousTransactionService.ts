import { prisma } from "./prisma";

export async function flagSuspiciousTransaction(transaction: any) {
  try {
    if (transaction.fiatAmount <= 30000) {
      return;
    }

    const existingCase = await prisma.case.findUnique({
      where: {
        transactionId: transaction.id,
      },
    });

    if (existingCase) {
      console.log(`Case already exists for transaction ${transaction.id}`);

      return;
    }

    const createdCase = await prisma.case.create({
      data: {
        caseId: `CASE-${Date.now()}`,
        userId: String(transaction.userId),
        transactionId: transaction.id,
        amount: transaction.fiatAmount,
        currency: transaction.currency,
        transactionType: transaction.transactionType,
        status: "OPEN",
        reason: "Transaction amount exceeded 30k threshold",
      },
    });

    console.log(
      `Suspicious transaction flagged. Case created: ${createdCase.caseId}`,
    );
  } catch (error) {
    console.error("Failed to flag suspicious transaction:", error);
  }
}
