import { prisma } from "./prisma";

export async function seedCurrencies() {
  const currencies = [
    {
      code: "USD",
      kind: "fiat",
      decimals: 2,
    },
    {
      code: "EUR",
      kind: "fiat",
      decimals: 2,
    },
    {
      code: "GBP",
      kind: "fiat",
      decimals: 2,
    },
    {
      code: "BTC",
      kind: "crypto",
      decimals: 8,
    },
    {
      code: "ETH",
      kind: "crypto",
      decimals: 8,
    },
    {
      code: "SOL",
      kind: "crypto",
      decimals: 8,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: {
        code: currency.code,
      },
      update: {},
      create: currency,
    });
  }

  console.log("Currencies seeded");
}
