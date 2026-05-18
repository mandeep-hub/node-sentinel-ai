import { flagSuspiciousTransaction } from "./suspiciousTransactionService";

import { prisma } from "./prisma";

let lastProcessedTransactionId: string | null = null;

export async function checkNewTransactions() {
  try {
    const baseUrl = "http://localhost:5100";

    let url = `${baseUrl}/transactions`;

    if (lastProcessedTransactionId) {
      url += `?fromId=${lastProcessedTransactionId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const transactions = await response.json();

    if (!transactions.length) {
      return;
    }

    for (const transaction of transactions) {
      await flagSuspiciousTransaction(transaction, prisma);

      lastProcessedTransactionId = transaction.id;
    }

    console.log(`Processed ${transactions.length} new transactions`);
  } catch (error) {
    console.error("Failed to check new transactions:", error);
  }
}
