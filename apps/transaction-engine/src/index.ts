import "dotenv/config";
import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";
import { updateCryptoPrices } from "./services/fxService";
import { transactionStore } from "./services/transactionStore";
import { convertCurrency } from "./services/exchangeRateService";
import { flagSuspiciousTransaction } from "./services/suspiciousTransactionService";
import { checkNewTransactions } from "./services/suspiciousTransactionChecker";
import { prisma } from "./services/prisma";

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.COINGECKO_API_KEY) {
  console.log("COINGECKO_API_KEY is missing in .env");
}

if (!process.env.CURRENCY_FREAKS_API_KEY) {
  console.log("CURRENCY_FREAKS_API_KEY is missing in .env");
}

setInterval(async () => {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    const createdTransaction = await transactionStore.create({
      data: transaction,
    });

    await flagSuspiciousTransaction(createdTransaction);

    console.log("Auto-generated transaction:", createdTransaction.id);
  } catch (error) {
    console.error("Failed to auto-generate transaction:", error);
  }
}, 40000);

setInterval(async () => {
  try {
    await checkNewTransactions();
  } catch (error) {
    console.error("Failed to check new transactions:", error);
  }
}, 10000);

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.post("/transactions/generate", async (req, res) => {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    const createdTransaction = await transactionStore.create({
      data: transaction,
    });

    await flagSuspiciousTransaction(createdTransaction);

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

    const generatedTransactions = [];

    for (let i = 0; i < 20; i++) {
      const transaction = await generateTransaction();

      const createdTransaction = await transactionStore.create({
        data: transaction,
      });

      await flagSuspiciousTransaction(createdTransaction);

      generatedTransactions.push(createdTransaction);
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
      orderBy: {
        createdAt: "asc",
      },
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
