import { Transaction } from "../models/Transaction";
import { getCryptoPrice, PriceCache } from "./fxService";
import { convertCurrency } from "./exchangeRateService";

const countries = ["US", "UK", "DE", "IR"];
const currencies = ["USD", "EUR", "GBP"];
const cryptoTypes = ["BTC", "ETH", "SOL"] as const;

function pickOtherCurrency(exclude: string): string {
  const options = currencies.filter((c) => c !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

export async function generateTransaction(): Promise<Transaction> {
  const fiatAmount = Math.floor(Math.random() * 50000);
  const transactionType = Math.random() > 0.5 ? "BUY" : "SELL";
  const cryptoType: keyof PriceCache =
    cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)];
  const cryptoPrice = getCryptoPrice(cryptoType);
  const cryptoAmount = Number((fiatAmount / cryptoPrice).toFixed(4));
  const currency = currencies[Math.floor(Math.random() * currencies.length)];

  const conversionFrom = currency;
  const conversionTo = pickOtherCurrency(conversionFrom);
  const conversionOriginalAmount = fiatAmount;

  let conversionConvertedAmount: number | undefined;

  try {
    conversionConvertedAmount = await convertCurrency(
      conversionOriginalAmount,
      conversionFrom,
      conversionTo,
    );
  } catch (err) {
    console.error("Fiat conversion failed during generation:", err);
  }

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId: Math.floor(Math.random() * 10) + 1,
    transactionType,
    cryptoType,
    fiatAmount,
    cryptoAmount,
    currency,
    country: countries[Math.floor(Math.random() * countries.length)],
    createdAt: new Date(),
    conversionFrom,
    conversionTo,
    conversionOriginalAmount,
    conversionConvertedAmount,
  };

  return transaction;
}
