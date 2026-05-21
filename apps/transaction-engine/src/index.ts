import "dotenv/config";

import express from "express";

import cors from "cors";

import transactionRoutes from "./routes/transactionRoutes";

import exchangeRoutes from "./routes/exchangeRoutes";

import caseRoutes from "./routes/caseRoutes";
import { initializeApp } from "./bootstrap/init";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/transactions", transactionRoutes);

app.use("/convert", exchangeRoutes);

app.use("/cases", caseRoutes);

if (!process.env.COINGECKO_API_KEY) {
  console.log("COINGECKO_API_KEY is missing in .env");
}

if (!process.env.CURRENCY_FREAKS_API_KEY) {
  console.log("CURRENCY_FREAKS_API_KEY is missing in .env");
}

initializeApp();

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
