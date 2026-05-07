import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.get("/transactions/generate", async (req, res) => {
  const transaction = await generateTransaction();

  res.json(transaction);
});

app.get("/transactions/generate-many", async (req, res) => {
  const transactions = [];

  for (let i = 0; i < 20; i++) {
    transactions.push(await generateTransaction());
  }

  res.json(transactions);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
