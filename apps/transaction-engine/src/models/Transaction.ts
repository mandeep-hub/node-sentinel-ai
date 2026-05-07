export interface Transaction {
  id: number;
  userId: number;
  transactionType: "BUY" | "SELL";
  cryptoType: string;
  fiatAmount: number;
  cryptoAmount: number;
  currency: string;
  country: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
}
