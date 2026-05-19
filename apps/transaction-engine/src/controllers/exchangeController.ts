import { Request, Response } from "express";

import { convertCurrency } from "../services/exchangeRateService";

export async function convertCurrencyHandler(req: Request, res: Response) {
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
}
