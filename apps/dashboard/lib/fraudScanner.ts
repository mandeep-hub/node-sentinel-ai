import { fetchTransactions } from "./transactionApi";

import { createCaseForSuspiciousTransaction } from "./caseService";

export async function scanTransactions() {
  const transactions = await fetchTransactions();

  for (const transaction of transactions) {
    const createdCase = await createCaseForSuspiciousTransaction(transaction);

    if (createdCase) {
      console.log(`Created fraud case for transaction ${transaction.id}`);
    }
  }

  console.log(`Scanned ${transactions.length} transactions`);
}
