import { prisma } from "./prisma";

import { getCryptoPrice, PriceCache } from "./fxService";

const fiatCurrencies = ["USD", "EUR", "GBP"];

const cryptoCurrencies = ["BTC", "ETH", "SOL"] as const;

const countries = [
  "US",
  "UK",
  "DE",
  "FR",
  "BR",
  "TR",
  "AE",
  "SG",
  "IN",
  "NG",
  "IR",
  "KP",
];

const professions = [
  "Salaried professional",
  "Self-employed / business owner",
  "Import / export or e-commerce",
  "Real estate",
  "Crypto or financial services",
  "Precious metals or commodities",
  "Gambling, adult, arms, or cash-intensive business",
  "Unclear activity",
];

const transactionKinds = ["deposit", "withdrawal", "trade"] as const;

const statuses = ["settled", "pending", "flagged", "reversed"] as const;

export interface UnsavedTransaction {
  userId: string;

  kind: "deposit" | "withdrawal" | "trade";

  creditCurrencyCode?: string;

  creditAmount?: number;

  debitCurrencyCode?: string;

  debitAmount?: number;

  status: "settled" | "pending" | "flagged" | "reversed";

  metadata?: {
    country: string;
    profession: string;

    exchangeRate?: number;
  };

  createdAt: Date;
}

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateFiatAmount() {
  const isSuspicious = Math.random() < 0.05;

  if (isSuspicious) {
    return Math.floor(Math.random() * 70000) + 30000;
  }

  return Math.floor(Math.random() * 5000) + 1000;
}

export async function generateTransaction(): Promise<UnsavedTransaction> {
  const kind = randomItem(transactionKinds);

  const country = randomItem(countries);
  const profession = randomItem(professions);

  const status = randomItem(statuses);

  const demoUserIds = ["user-1", "user-2", "user-3"];

  const userId = demoUserIds[Math.floor(Math.random() * demoUserIds.length)];

  const balances = await prisma.balance.findMany({
    where: {
      userId,
    },
  });

  const spendableBalances = balances.filter(
    (balance) => Number(balance.amount) > 10,
  );

  if (spendableBalances.length === 0) {
    const fiatCurrency = randomItem(fiatCurrencies);

    const fiatAmount = generateFiatAmount();

    return {
      userId,

      kind: "deposit",

      creditCurrencyCode: fiatCurrency,

      creditAmount: fiatAmount,

      status,

      metadata: {
        country,
        profession,
      },

      createdAt: new Date(),
    };
  }

  const selectedBalance = randomItem(spendableBalances);

  const currencyCode = selectedBalance.currencyCode;

  const currentBalance = Number(selectedBalance.amount);

  const maxSpendable = currentBalance * 0.2;

  let spendAmount = Number((Math.random() * maxSpendable + 1).toFixed(2));

  const generateLargeTransaction = Math.random() < 0.05;

  if (generateLargeTransaction) {
    spendAmount = Number((Math.random() * 70000 + 30000).toFixed(2));
  }

  if (kind === "trade" && fiatCurrencies.includes(currencyCode)) {
    const cryptoCurrency: keyof PriceCache = randomItem(cryptoCurrencies);

    const cryptoPrice = getCryptoPrice(cryptoCurrency);

    const cryptoAmount = Number((spendAmount / cryptoPrice).toFixed(6));

    return {
      userId,

      kind,

      debitCurrencyCode: currencyCode,

      debitAmount: spendAmount,

      creditCurrencyCode: cryptoCurrency,

      creditAmount: cryptoAmount,

      status,

      metadata: {
        country,
        profession,

        exchangeRate: cryptoPrice,
      },

      createdAt: new Date(),
    };
  }

  if (
    kind === "trade" &&
    cryptoCurrencies.includes(currencyCode as keyof PriceCache)
  ) {
    const cryptoPrice = getCryptoPrice(currencyCode as keyof PriceCache);

    const fiatCurrency = randomItem(fiatCurrencies);

    const fiatAmount = Number((spendAmount * cryptoPrice).toFixed(2));

    return {
      userId,

      kind,

      debitCurrencyCode: currencyCode,

      debitAmount: spendAmount,

      creditCurrencyCode: fiatCurrency,

      creditAmount: fiatAmount,

      status,

      metadata: {
        country,
        profession,

        exchangeRate: cryptoPrice,
      },

      createdAt: new Date(),
    };
  }

  if (kind === "withdrawal") {
    return {
      userId,

      kind,

      debitCurrencyCode: currencyCode,

      debitAmount: spendAmount,

      status,

      metadata: {
        country,
        profession,
      },

      createdAt: new Date(),
    };
  }

  const fiatCurrency = randomItem(fiatCurrencies);

  const fiatAmount = generateFiatAmount();

  return {
    userId,

    kind: "deposit",

    creditCurrencyCode: fiatCurrency,

    creditAmount: fiatAmount,

    status,

    metadata: {
      country,
      profession,
    },

    createdAt: new Date(),
  };
}

export async function generateTransactions(
  num = 5,
): Promise<UnsavedTransaction[]> {
  const transactions: UnsavedTransaction[] = [];

  for (let i = 0; i < num; i++) {
    const transaction = await generateTransaction();

    transactions.push(transaction);
  }

  return transactions;
}
