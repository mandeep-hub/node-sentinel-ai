import { prisma } from "./prisma";

import { convertCurrency } from "./exchangeRateService";

type Transaction = {
  id: string;

  userId: string;

  kind: string;

  debitCurrencyCode?: string;

  debitAmount?: number;

  creditCurrencyCode?: string;

  creditAmount?: number;

  country?: string;

  profession?: string;
};

export async function createCaseForSuspiciousTransaction(
  transaction: Transaction,
) {
  const debitAmount = Number(transaction.debitAmount || 0);

  const creditAmount = Number(transaction.creditAmount || 0);

  const debitCurrency = transaction.debitCurrencyCode || "USD";

  const creditCurrency = transaction.creditCurrencyCode || "USD";

  const debitAmountInUsd =
    debitAmount > 0
      ? await convertCurrency(debitAmount, debitCurrency, "USD")
      : 0;

  const creditAmountInUsd =
    creditAmount > 0
      ? await convertCurrency(creditAmount, creditCurrency, "USD")
      : 0;

  const isDebitSuspicious = debitAmountInUsd >= 10000;

  const isCreditSuspicious = creditAmountInUsd >= 10000;

  const isSuspicious = isDebitSuspicious || isCreditSuspicious;

  if (!isSuspicious) {
    return null;
  }

  const existingCase = await prisma.case.findUnique({
    where: {
      transactionId: transaction.id,
    },
  });

  if (existingCase) {
    return null;
  }

  const caseAmount = isDebitSuspicious ? debitAmount : creditAmount;

  const caseCurrency = isDebitSuspicious ? debitCurrency : creditCurrency;

  const reason = isDebitSuspicious
    ? "Debit transaction exceeded 10k USD threshold"
    : "Credit transaction exceeded 10k USD threshold";

  return prisma.case.create({
    data: {
      caseId: `CASE-${Date.now()}`,

      transactionId: transaction.id,

      userId: transaction.userId,

      amount: caseAmount,

      currency: caseCurrency,

      transactionType: transaction.kind,

      status: "OPEN",

      reason,

      country: transaction.country,

      profession: transaction.profession,
    },
  });
}
