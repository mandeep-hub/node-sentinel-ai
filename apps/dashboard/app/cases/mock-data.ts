export interface Case {
  caseId: string;
  userId: number;
  amount: number;
  transactionId: string;
  currency: string;
  transactionType: "BUY" | "SELL";
  status: "open" | "processing" | "closed";
}

export const MOCK_CASES: Case[] = [
  {
    caseId: "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
    userId: 3,
    amount: 45000,
    transactionId: "t1a2b3c4-d5e6-7890-abcd-ef1234567890",
    currency: "USD",
    transactionType: "BUY",
    status: "open",
  },
  {
    caseId: "c2b3c4d5-e6f7-8901-bcde-f12345678901",
    userId: 7,
    amount: 82500,
    transactionId: "t2b3c4d5-e6f7-8901-bcde-f12345678901",
    currency: "EUR",
    transactionType: "SELL",
    status: "processing",
  },
  {
    caseId: "c3c4d5e6-f7a8-9012-cdef-123456789012",
    userId: 1,
    amount: 31200,
    transactionId: "t3c4d5e6-f7a8-9012-cdef-123456789012",
    currency: "GBP",
    transactionType: "BUY",
    status: "closed",
  },
  {
    caseId: "c4d5e6f7-a8b9-0123-defa-234567890123",
    userId: 5,
    amount: 120000,
    transactionId: "t4d5e6f7-a8b9-0123-defa-234567890123",
    currency: "USD",
    transactionType: "SELL",
    status: "open",
  },
  {
    caseId: "c5e6f7a8-b9c0-1234-efab-345678901234",
    userId: 9,
    amount: 55750,
    transactionId: "t5e6f7a8-b9c0-1234-efab-345678901234",
    currency: "EUR",
    transactionType: "BUY",
    status: "processing",
  },
];
