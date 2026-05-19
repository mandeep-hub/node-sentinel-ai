import {
  generateTransactions,
  UnsavedTransaction,
} from "../services/transactionGenerator";

import { createTransaction } from "../services/transactionService";

export async function createRandomTransactions() {
  try {
    const transactions: UnsavedTransaction[] = await generateTransactions(
      Math.ceil(Math.random() * 5),
    );

    for (const transaction of transactions) {
      await createTransaction(transaction);
    }

    console.log(`Created ${transactions.length} transactions`);
  } catch (error) {
    console.error("Failed to create random transactions:", error);
  }
}

export function startTransactionJobs() {
  setInterval(createRandomTransactions, 4000);
}
