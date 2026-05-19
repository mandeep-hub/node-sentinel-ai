import { Request, Response } from "express";

import { Transaction } from "@prisma/client";

import { generateTransaction } from "../services/transactionGenerator";

import { transactionStore } from "../services/transactionStore";

import { updateCryptoPrices } from "../services/fxService";

import { createTransaction } from "../services/transactionService";

export async function generateTransactionHandler(req: Request, res: Response) {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    const createdTransaction: Transaction =
      await createTransaction(transaction);

    res.json(createdTransaction);
  } catch (error) {
    console.error("Generate transaction error:", error);

    res.status(500).json({
      error: "Failed to generate transaction",
    });
  }
}

export async function generateManyTransactionsHandler(
  req: Request,
  res: Response,
) {
  try {
    await updateCryptoPrices();

    const generatedTransactions: Transaction[] = [];

    for (let i = 0; i < 20; i++) {
      const transaction = await generateTransaction();

      const createdTransaction = await createTransaction(transaction);

      generatedTransactions.push(createdTransaction);
    }

    res.json(generatedTransactions);
  } catch (error) {
    console.error("Generate many transactions error:", error);

    res.status(500).json({
      error: "Failed to generate transactions",
    });
  }
}

export async function getTransactionsHandler(req: Request, res: Response) {
  try {
    const fromId = req.query.fromId as string;

    const allTransactions = await transactionStore.findMany({
      include: {
        user: true,

        debitCurrency: true,

        creditCurrency: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });

    if (!fromId) {
      return res.json(allTransactions);
    }

    const transactionIndex = allTransactions.findIndex(
      (transaction: { id: string }) => transaction.id === fromId,
    );

    if (transactionIndex === -1) {
      return res.status(404).json({
        error: "Transaction ID not found",
      });
    }

    const filteredTransactions = allTransactions.slice(transactionIndex + 1);

    res.json(filteredTransactions);
  } catch (error) {
    console.error("Retrieve transactions error:", error);

    res.status(500).json({
      error: "Failed to retrieve transactions",
    });
  }
}
