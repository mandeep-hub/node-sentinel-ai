export interface Transaction {
  id: string;
  userId: number;
  transactionType: "BUY" | "SELL";
  cryptoType: string;
  fiatAmount: number;
  cryptoAmount: number;
  currency: string;
  country: string;
  createdAt: Date;
}

export type UnsavedTransaction = Omit<Transaction, "id">;
