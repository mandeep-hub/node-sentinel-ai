export async function flagSuspiciousTransaction(transaction: any, tx: any) {
  try {
    const debitAmount = Number(transaction.debitAmount || 0);

    const isSuspicious =
      transaction.debitCurrencyCode === "USD" && debitAmount >= 30000;

    if (!isSuspicious) {
      return;
    }

    const existingCase = await tx.case.findUnique({
      where: {
        transactionId: transaction.id,
      },
    });

    if (existingCase) {
      return;
    }
    await tx.transaction.update({
      where: {
        id: transaction.id,
      },

      data: {
        status: "flagged",

        flaggedAt: new Date(),

        flagReason: "Transaction amount exceeded 30k threshold",
      },
    });

    const createdCase = await tx.case.create({
      data: {
        caseId: `CASE-${Date.now()}`,

        userId: transaction.userId,

        transactionId: transaction.id,

        amount: debitAmount,

        currency: transaction.debitCurrencyCode,

        transactionType: transaction.kind,

        status: "OPEN",

        reason: "Large USD debit transaction exceeded 30k threshold",
      },
    });

    console.log(
      `Suspicious transaction flagged. Case created: ${createdCase.caseId}`,
    );
  } catch (error) {
    console.error("Failed to flag suspicious transaction:", error);
  }
}
