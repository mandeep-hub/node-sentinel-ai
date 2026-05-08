import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";
import { updateCryptoPrices } from "./services/fxService";
import { transactions } from "./services/transactionStore";

const app = express();

app.use(cors());
app.use(express.json());

setInterval(async () => {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    transactions.push(transaction);

    console.log("Auto-generated transaction:", transaction.id);
  } catch (error) {
    console.error("Failed to auto-generate transaction:", error);
  }
}, 40000);

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.post("/transactions/generate", async (req, res) => {
  try {
    await updateCryptoPrices();

    const transaction = await generateTransaction();

    transactions.push(transaction);

    res.json(transaction);
  } catch (error) {
    console.error(error);

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

      transactions.push(transaction);

      generatedTransactions.push(transaction);
    }

    res.json(generatedTransactions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate transactions",
    });
  }
});

app.get("/transactions", (req, res) => {
  const fromId = req.query.fromId as string;

  if (!fromId) {
    return res.json(transactions);
  }

  const transactionIndex = transactions.findIndex(
    (transaction) => transaction.id === fromId,
  );

  if (transactionIndex === -1) {
    return res.status(404).json({
      error: "Transaction ID not found",
    });
  }

  const filteredTransactions = transactions.slice(transactionIndex + 1);

  res.json(filteredTransactions);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
