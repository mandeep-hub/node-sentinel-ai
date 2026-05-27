export async function getExchangeRates() {
  try {
    const apiKey = process.env.CURRENCY_FREAKS_API_KEY;

    if (!apiKey) {
      throw new Error("CurrencyFreaks API key is missing");
    }

    const response = await fetch(
      `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Fetched exchange rates once");

    return data.rates as Record<string, string>;
  } catch (error) {
    console.error("Using fallback exchange rates due to API failure");

    return {
      USD: "1",
      EUR: "0.92",
      GBP: "0.78",
      CAD: "1.36",
      AUD: "1.52",
      JPY: "157",
      INR: "83.1",
      AED: "3.67",
      CHF: "0.89",
      SGD: "1.35",
      BTC: "0.000015",
      ETH: "0.00032",
      SOL: "0.0068",
    };
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, string>,
) {
  const fromRate = parseFloat(rates[from] || "0");

  const toRate = parseFloat(rates[to] || "0");

  if (!fromRate || !toRate) {
    console.warn(`Unsupported currency conversion: ${from} -> ${to}`);

    return amount;
  }

  const usdAmount = amount / fromRate;

  const convertedAmount = usdAmount * toRate;

  return Number(convertedAmount.toFixed(2));
}
