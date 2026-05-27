import { fetchTransactions } from "./transactionApi";

import { createCaseForSuspiciousTransaction } from "./caseService";

import { getExchangeRates } from "./exchangeRateService";

export async function scanTransactions() {
  const transactions = await fetchTransactions();

  const rates = await getExchangeRates();

  for (const transaction of transactions) {
    const createdCase = await createCaseForSuspiciousTransaction(
      transaction,
      rates,
    );

    if (createdCase) {
      console.log(`Created fraud case for transaction ${transaction.id}`);
    }
  }

  console.log(`Scanned ${transactions.length} transactions`);
}
