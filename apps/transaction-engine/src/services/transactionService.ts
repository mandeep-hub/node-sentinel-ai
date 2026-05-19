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

      return createdTransaction;
    });
  } catch (error) {
    console.error("Failed to create transaction:", error);

    throw error;
  }
}
