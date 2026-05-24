import { Prisma, Transaction } from "@prisma/client";

import { prisma } from "./prisma";

import { updateBalances } from "./balanceService";

export async function createTransaction(
  transactionData: Prisma.TransactionUncheckedCreateInput,
): Promise<Transaction> {
  try {
    return await prisma.$transaction(async (dbTx) => {
      const createdTransaction = await dbTx.transaction.create({
        data: transactionData,
      });

      await updateBalances(createdTransaction, dbTx);

      await fetch("http://localhost:3000/api/cases", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: createdTransaction.id,

          userId: createdTransaction.userId,

          kind: createdTransaction.kind,

          debitCurrencyCode: createdTransaction.debitCurrencyCode || undefined,

          debitAmount: createdTransaction.debitAmount
            ? Number(createdTransaction.debitAmount)
            : undefined,

          creditCurrencyCode:
            createdTransaction.creditCurrencyCode || undefined,

          creditAmount: createdTransaction.creditAmount
            ? Number(createdTransaction.creditAmount)
            : undefined,

          country: createdTransaction.country || undefined,

          profession: createdTransaction.profession || undefined,
        }),
      });

      return createdTransaction;
    });
  } catch (error) {
    console.error("Failed to create transaction:", error);

    throw error;
  }
}
