import { prisma } from "./prisma";

type Transaction = {
  id: string;

  userId: string;

  kind: string;

  debitCurrencyCode?: string;

  debitAmount?: number;
};

export async function createCaseForSuspiciousTransaction(
  transaction: Transaction,
) {
  const debitAmount = Number(transaction.debitAmount || 0);

  const isSuspicious =
    transaction.debitCurrencyCode === "USD" && debitAmount >= 30000;

  if (!isSuspicious) {
    return null;
  }

  const existingCase = await prisma.case.findUnique({
    where: {
      transactionId: transaction.id,
    },
  });

  if (existingCase) {
    return existingCase;
  }

  return prisma.case.create({
    data: {
      caseId: `CASE-${Date.now()}`,

      transactionId: transaction.id,

      userId: transaction.userId,

      amount: debitAmount,

      currency: transaction.debitCurrencyCode!,

      transactionType: transaction.kind,

      status: "OPEN",

      reason: "Large USD debit transaction exceeded 30k threshold",
    },
  });
}
