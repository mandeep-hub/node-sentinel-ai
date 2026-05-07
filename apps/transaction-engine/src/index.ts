import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";
import { updateCryptoPrices } from "./services/fxService";
import { transactions } from "./services/transactionStore";

const app = express();

app.use(cors());
app.use(express.json());

updateCryptoPrices();

setInterval(() => {
  updateCryptoPrices();
}, 30000);

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.get("/transactions/generate", async (req, res) => {
  try {
    const transaction = await generateTransaction();

    res.json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate transaction",
    });
  }
});

app.get("/transactions/generate-many", async (req, res) => {
  try {
    const generatedTransactions = [];

    for (let i = 0; i < 20; i++) {
      generatedTransactions.push(await generateTransaction());
    }

    res.json(generatedTransactions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate transactions",
    });
  }
});

// List all stored transactions

app.get("/transactions", (req, res) => {
  res.json(transactions);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
