export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
) {
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

    console.log("CurrencyFreaks response:", data);

    const rates = data.rates;

    const fromRate = parseFloat(rates[from]);
    const toRate = parseFloat(rates[to]);

    if (!fromRate || !toRate) {
      throw new Error("Unsupported currency");
    }

    const usdAmount = amount / fromRate;

    const convertedAmount = usdAmount * toRate;

    return Number(convertedAmount.toFixed(2));
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);

    throw new Error("Currency conversion failed");
  }
}
