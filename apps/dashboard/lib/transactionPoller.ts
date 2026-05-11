const ENGINE_URL = "http://localhost:5000";

export interface Transaction {
  id: string;
  userId: number;
  transactionType: "BUY" | "SELL";
  cryptoType: "BTC" | "ETH" | "SOL";
  fiatAmount: number;
  cryptoAmount: number;
  currency: string;
  country: string;
  createdAt: string;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${ENGINE_URL}/transactions`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
