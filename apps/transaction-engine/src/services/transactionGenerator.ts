import { Transaction } from "../models/Transaction";
import { getCryptoPrice, PriceCache } from "./fxService";

const countries = ["US", "UK", "DE", "IR"];
const currencies = ["USD", "EUR", "GBP"];
const cryptoTypes = ["BTC", "ETH", "SOL"] as const;

export async function generateTransaction(): Promise<Transaction> {
  const fiatAmount = Math.floor(Math.random() * 50000);

  const transactionType = Math.random() > 0.5 ? "BUY" : "SELL";

  const cryptoType: keyof PriceCache =
    cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)];

  const cryptoPrice = getCryptoPrice(cryptoType);

  const cryptoAmount = Number((fiatAmount / cryptoPrice).toFixed(4));

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId: Math.floor(Math.random() * 10) + 1,
    transactionType,
    cryptoType,
    fiatAmount,
    cryptoAmount,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    createdAt: new Date(),
  };

  return transaction;
}
