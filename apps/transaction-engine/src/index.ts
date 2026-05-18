import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  generateTransaction,
  generateTransactions,
} from "./services/transactionGenerator";

import { updateCryptoPrices } from "./services/fxService";

import { transactionStore } from "./services/transactionStore";

import { convertCurrency } from "./services/exchangeRateService";

import { flagSuspiciousTransaction } from "./services/suspiciousTransactionService";

import { prisma } from "./services/prisma";

import { seedUsers } from "./services/seedUsers";

import { seedCurrencies } from "./services/seedCurrencies";

import { updateBalances } from "./services/balanceService";
import { seedBalances } from "./services/seedBalances";

const app = express();

app.use(cors());

app.use(express.json());

if (!process.env.COINGECKO_API_KEY) {
  console.log("COINGECKO_API_KEY is missing in .env");
}

if (!process.env.CURRENCY_FREAKS_API_KEY) {
  console.log("CURRENCY_FREAKS_API_KEY is missing in .env");
}

async function createRandomTransactions() {
  try {
    const transactions = await generateTransactions(
      Math.ceil(Math.random() * 5),
    );

    for (const transaction of transactions) {
      await prisma.$transaction(async (tx) => {
        const createdTransaction = await tx.transaction.create({
          data: transaction,
        });

        await updateBalances(createdTransaction, tx);

        await flagSuspiciousTransaction(createdTransaction, tx);
      });
    }

    console.log(`Created ${transactions.length} transactions`);
  } catch (error) {
    console.error("Failed to create random transactions:", error);
  }
}

async function init() {
  await seedUsers();

  await seedCurrencies();
  await seedBalances();

  await updateCryptoPrices();

  setInterval(updateCryptoPrices, 40000);

  setInterval(createRandomTransactions, 4000);
}

init();

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.post("/transactions/generate", async (req, res) => {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    let createdTransaction: any;

    await prisma.$transaction(async (tx) => {
      createdTransaction = await tx.transaction.create({
        data: transaction,
      });

      await updateBalances(createdTransaction, tx);

      await flagSuspiciousTransaction(createdTransaction, tx);
    });

    res.json(createdTransaction);
  } catch (error) {
    console.error("Generate transaction error:", error);

    res.status(500).json({
      error: "Failed to generate transaction",
    });
  }
});

app.post("/transactions/generate-many", async (req, res) => {
  try {
    await updateCryptoPrices();

    const generatedTransactions: any[] = [];

    for (let i = 0; i < 20; i++) {
      const transaction = await generateTransaction();

      await prisma.$transaction(async (tx) => {
        const createdTransaction = await tx.transaction.create({
          data: transaction,
        });

        await updateBalances(createdTransaction, tx);

        await flagSuspiciousTransaction(createdTransaction, tx);

        generatedTransactions.push(createdTransaction);
      });
    }

    res.json(generatedTransactions);
  } catch (error) {
    console.error("Generate many transactions error:", error);

    res.status(500).json({
      error: "Failed to generate transactions",
    });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const fromId = req.query.fromId as string;

    const allTransactions = await transactionStore.findMany({
      include: {
        user: true,
        debitCurrency: true,
        creditCurrency: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });

    if (!fromId) {
      return res.json(allTransactions);
    }

    const transactionIndex = allTransactions.findIndex(
      (transaction: { id: string }) => transaction.id === fromId,
    );

    if (transactionIndex === -1) {
      return res.status(404).json({
        error: "Transaction ID not found",
      });
    }

    const filteredTransactions = allTransactions.slice(transactionIndex + 1);

    res.json(filteredTransactions);
  } catch (error) {
    console.error("Retrieve transactions error:", error);

    res.status(500).json({
      error: "Failed to retrieve transactions",
    });
  }
});

app.get("/cases", async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(cases);
  } catch (error) {
    console.error("Failed to retrieve cases:", error);

    res.status(500).json({
      error: "Failed to retrieve cases",
    });
  }
});

app.get("/cases/open/count", async (req, res) => {
  try {
    const openAlerts = await prisma.case.count({
      where: {
        status: "OPEN",
      },
    });

    res.json({
      openAlerts,
    });
  } catch (error) {
    console.error("Failed to retrieve open alerts:", error);

    res.status(500).json({
      error: "Failed to retrieve open alerts",
    });
  }
});

app.get("/convert", async (req, res) => {
  try {
    const amount = Number(req.query.amount);

    const from = req.query.from as string;

    const to = req.query.to as string;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        error: "Missing currency parameters",
      });
    }

    const currencyRegex = /^[A-Z]{3}$/;

    if (!currencyRegex.test(from) || !currencyRegex.test(to)) {
      return res.status(400).json({
        error: "Invalid currency code",
      });
    }

    const converted = await convertCurrency(amount, from, to);

    res.json({
      from,
      to,
      originalAmount: amount,
      convertedAmount: converted,
    });
  } catch (error) {
    console.error("Conversion error:", error);

    res.status(400).json({
      error: error instanceof Error ? error.message : "Conversion failed",
    });
  }
});

app.patch("/cases/:caseId/status", async (req, res) => {
  try {
    const { caseId } = req.params;

    const { status } = req.body;

    const allowedStatuses = ["OPEN", "PROCESSING", "CLOSED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values are OPEN, PROCESSING, CLOSED",
      });
    }

    const existingCase = await prisma.case.findUnique({
      where: {
        caseId,
      },
    });

    if (!existingCase) {
      return res.status(404).json({
        error: "Case not found",
      });
    }

    const updatedCase = await prisma.case.update({
      where: {
        caseId,
      },

      data: {
        status,
      },
    });

    res.json(updatedCase);
  } catch (error) {
    console.error("Failed to update case status:", error);

    res.status(500).json({
      error: "Failed to update case status",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
