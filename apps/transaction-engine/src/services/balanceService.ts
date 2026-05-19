import { Prisma, Transaction } from "@prisma/client";

export async function updateBalances(
  transaction: Transaction,
  tx: Prisma.TransactionClient,
) {
  try {
    if (transaction.creditCurrencyCode && transaction.creditAmount) {
      const existingCreditBalance = await tx.balance.findUnique({
        where: {
          userId_currencyCode: {
            userId: transaction.userId,
            currencyCode: transaction.creditCurrencyCode,
          },
        },
      });

      if (existingCreditBalance) {
        await tx.balance.update({
          where: {
            userId_currencyCode: {
              userId: transaction.userId,
              currencyCode: transaction.creditCurrencyCode,
            },
          },

          data: {
            amount:
              Number(existingCreditBalance.amount) +
              Number(transaction.creditAmount),
          },
        });
      } else {
        await tx.balance.create({
          data: {
            userId: transaction.userId,

            currencyCode: transaction.creditCurrencyCode,

            amount: transaction.creditAmount,
          },
        });
      }
    }

    if (transaction.debitCurrencyCode && transaction.debitAmount) {
      const existingDebitBalance = await tx.balance.findUnique({
        where: {
          userId_currencyCode: {
            userId: transaction.userId,

            currencyCode: transaction.debitCurrencyCode,
          },
        },
      });

      const currentAmount = Number(existingDebitBalance?.amount || 0);

      const debitAmount = Number(transaction.debitAmount || 0);

      if (currentAmount < debitAmount) {
        throw new Error(
          `Insufficient funds for ${transaction.debitCurrencyCode}`,
        );
      }

      if (existingDebitBalance) {
        await tx.balance.update({
          where: {
            userId_currencyCode: {
              userId: transaction.userId,

              currencyCode: transaction.debitCurrencyCode,
            },
          },

          data: {
            amount:
              Number(existingDebitBalance.amount) -
              Number(transaction.debitAmount),
          },
        });
      } else {
        throw new Error(
          `No balance found for ${transaction.debitCurrencyCode}`,
        );
      }
    }
  } catch (error) {
    console.error("Failed to update balances:", error);

    throw error;
  }
}
