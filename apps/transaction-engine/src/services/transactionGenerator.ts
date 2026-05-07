import { Transaction } from "../models/Transaction";

const countries = ["US", "UK", "DE", "IR"];
const currencies = ["USD", "EUR", "GBP"];
const cryptoTypes = ["BTC", "ETH", "SOL"];

let currentId = 1;

export function generateTransaction(): Transaction {
  const fiatAmount = Math.floor(Math.random() * 50000);

  const cryptoAmount = Number((Math.random() * 2).toFixed(4));

  const transactionType = Math.random() > 0.5 ? "BUY" : "SELL";

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

  if (fiatAmount > 30000) {
    riskLevel = "HIGH";
  } else if (fiatAmount > 10000) {
    riskLevel = "MEDIUM";
  }

  return {
    id: currentId++,
    userId: Math.floor(Math.random() * 10) + 1,
    transactionType,
    cryptoType: cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)],
    fiatAmount,
    cryptoAmount,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    riskLevel,
    createdAt: new Date(),
  };
}

/* import { Transaction } from "../models/Transaction";

const countries = ["US", "UK", "DE", "IR"];
const currencies = ["USD", "EUR", "GBP"];

let currentId = 1;

export function generateTransaction(): Transaction {
  const amount = Math.floor(Math.random() * 50000);

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

  if (amount > 30000) {
    riskLevel = "HIGH";
  } else if (amount > 10000) {
    riskLevel = "MEDIUM";
  }

  return {
    id: currentId++,
    senderId: Math.floor(Math.random() * 10) + 1,
    receiverId: Math.floor(Math.random() * 10) + 1,
    amount,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    riskLevel,
    createdAt: new Date(),
  };
}
 */
