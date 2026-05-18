import { prisma } from "./prisma";

export async function seedBalances() {
  const users = ["user-1", "user-2", "user-3"];

  const balances = [
    {
      currencyCode: "USD",
      amount: 1000000,
    },
    {
      currencyCode: "EUR",
      amount: 750000,
    },
    {
      currencyCode: "GBP",
      amount: 500000,
    },
    {
      currencyCode: "BTC",
      amount: 10,
    },
    {
      currencyCode: "ETH",
      amount: 100,
    },
    {
      currencyCode: "SOL",
      amount: 1000,
    },
  ];

  for (const userId of users) {
    for (const balance of balances) {
      await prisma.balance.upsert({
        where: {
          userId_currencyCode: {
            userId,
            currencyCode: balance.currencyCode,
          },
        },

        update: {},

        create: {
          userId,

          currencyCode: balance.currencyCode,

          amount: balance.amount,
        },
      });
    }
  }

  console.log("Demo balances seeded");
}
