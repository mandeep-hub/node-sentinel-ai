import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

interface Transaction {
  id: number;
  userId: string;
  type: "deposit" | "transfer";
  amount: number;
  currency: "USD" | "BTC" | "ETH";
  timestamp: string;
  status: "completed" | "pending";
}

const transactions: Transaction[] = [];
let nextId = 1;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransaction(): Transaction {
  const transaction: Transaction = {
    id: nextId++,
    userId: `user_${Math.floor(Math.random() * 10) + 1}`,
    type: pick(["deposit", "transfer"]),
    amount: Math.round((Math.random() * 9900 + 100) * 100) / 100,
    currency: pick(["USD", "BTC", "ETH"]),
    timestamp: new Date().toISOString(),
    status: pick(["completed", "pending"]),
  };
  transactions.push(transaction);
  return transaction;
}

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

app.get("/transactions", (req, res) => {
  const fromId = req.query.fromId;
  if (fromId !== undefined) {
    const fromIdNum = Number(fromId);
    res.json(transactions.filter((t) => t.id > fromIdNum));
  } else {
    res.json(transactions);
  }
});

app.post("/transactions/generate", (req, res) => {
  res.json(generateTransaction());
});

app.post("/transactions/generate-many", (req, res) => {
  const newTransactions: Transaction[] = [];
  for (let i = 0; i < 20; i++) {
    newTransactions.push(generateTransaction());
  }
  res.json(newTransactions);
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
  setInterval(generateTransaction, 30_000);
});
