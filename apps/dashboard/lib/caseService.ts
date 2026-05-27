import { prisma } from "./prisma";
import { generateAiSummary } from "./aiSummaryService";
import { convertCurrency } from "./exchangeRateService";
import { calculateRiskScore } from "@/lib/riskScoreService";

type Transaction = {
  id: string;

  userId: string;

  kind: string;

  status?: string;

  debitCurrencyCode?: string;

  debitAmount?: number;

  creditCurrencyCode?: string;

  creditAmount?: number;

  country?: string;

  profession?: string;
};

export async function createCaseForSuspiciousTransaction(
  transaction: Transaction,
  rates: Record<string, string>,
) {
  if (transaction.status !== "flagged") {
    return null;
  }

  const debitAmount = Number(transaction.debitAmount || 0);

  const creditAmount = Number(transaction.creditAmount || 0);

  const debitCurrency = transaction.debitCurrencyCode || "USD";

  const creditCurrency = transaction.creditCurrencyCode || "USD";

  const debitAmountInUsd =
    debitAmount > 0
      ? convertCurrency(debitAmount, debitCurrency, "USD", rates)
      : 0;

  const creditAmountInUsd =
    creditAmount > 0
      ? convertCurrency(creditAmount, creditCurrency, "USD", rates)
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

  let aiSummary = `A high-value ${transaction.kind} transaction involving ${caseCurrency} ${caseAmount} exceeded AML monitoring thresholds and requires additional compliance review.`;

  try {
    aiSummary = await generateAiSummary({
      transactionType: transaction.kind,
      currency: caseCurrency,
      amount: caseAmount.toString(),
      country: transaction.country || null,
      profession: transaction.profession || null,
      escalated: false,
    });
  } catch (error) {
    console.warn("Gemini failed. Using fallback summary.", error);
  }

  const newCase = await prisma.case.create({
    data: {
      caseId: `CASE-${Date.now()}`,

      transactionId: transaction.id,

      userId: transaction.userId,

      amount: caseAmount,

      currency: caseCurrency,

      transactionType: transaction.kind,

      status: "OPEN",
      aiSummary,

      reason,

      country: transaction.country,

      profession: transaction.profession,
    },
  });

  const userCases = await prisma.case.findMany({
    where: { userId: newCase.userId },
    select: {
      status: true,
      riskScore: true,
      amount: true,
      createdAt: true,
      transactionType: true,
    },
  });

  const { riskScore, riskBand } = calculateRiskScore(
    newCase.country ?? "",
    newCase.profession ?? "",
    userCases.map((uc) => ({
      status: uc.status as "OPEN" | "IN_REVIEW" | "CLOSED",
      riskScore: uc.riskScore ?? 0,
      amount: uc.amount,
      createdAt: uc.createdAt,
      transactionType: uc.transactionType as "deposit" | "withdrawal" | "trade",
    })),
  );

  return prisma.case.update({
    where: { id: newCase.id },
    data: { riskScore, riskBand },
  });
}
