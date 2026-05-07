import express from "express";
import cors from "cors";

import { generateTransaction } from "./services/transactionGenerator";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

//Generate a single simulated transaction

app.get("/transactions/generate", (req, res) => {
  const transaction = generateTransaction();

  res.json(transaction);
});

//Generate multiple simulated transactions

app.get("/transactions/generate-many", (req, res) => {
  const transactions = [];

  for (let i = 0; i < 20; i++) {
    transactions.push(generateTransaction());
  }

  res.json(transactions);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});

/* import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
 */
