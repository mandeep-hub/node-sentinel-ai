let cachedRates: Record<string, string> | null = null;

let lastFetchTime = 0;

let fetchPromise: Promise<any> | null = null;

const CACHE_DURATION = 5 * 60 * 1000;

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 157,
  INR: 83.1,
  AED: 3.67,
  CHF: 0.89,
  SGD: 1.35,
  BTC: 0.000015,
  ETH: 0.00032,
  SOL: 0.0068,
};

function convertWithRates(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, string | number>,
) {
  const fromRateValue = rates[from];

  const toRateValue = rates[to];

  if (!fromRateValue || !toRateValue) {
    console.warn(`Unsupported currency conversion: ${from} -> ${to}`);

    return amount;
  }

  const fromRate = Number(fromRateValue);

  const toRate = Number(toRateValue);

  const usdAmount = amount / fromRate;

  const convertedAmount = usdAmount * toRate;

  return Number(convertedAmount.toFixed(2));
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
) {
  try {
    if (from === to) {
      return amount;
    }

    const now = Date.now();

    if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
      return convertWithRates(amount, from, to, cachedRates);
    }

    const apiKey = process.env.CURRENCY_FREAKS_API_KEY;

    if (!apiKey) {
      throw new Error("CurrencyFreaks API key is missing");
    }

    if (!fetchPromise) {
      fetchPromise = fetch(
        `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}`,
      )
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Currency API error: ${response.status}`);
          }

          return response.json();
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    try {
      const data = await fetchPromise;

      cachedRates = data.rates;

      lastFetchTime = now;

      return convertWithRates(amount, from, to, cachedRates!);
    } catch (apiError) {
      console.warn("Using fallback exchange rates due to API failure");

      return convertWithRates(amount, from, to, FALLBACK_RATES);
    }
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);

    throw new Error("Currency conversion failed");
  }
}
