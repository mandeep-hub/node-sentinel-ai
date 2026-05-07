import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";
import { updateCryptoPrices } from "./services/fxService";

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

// Generate a single simulated transaction

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

// Generate multiple simulated transactions

app.get("/transactions/generate-many", async (req, res) => {
  try {
    const transactions = [];

    for (let i = 0; i < 20; i++) {
      transactions.push(await generateTransaction());
    }

    res.json(transactions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate transactions",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
