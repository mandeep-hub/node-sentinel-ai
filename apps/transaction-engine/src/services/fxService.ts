export type PriceCache = {
  BTC: number;
  ETH: number;
  SOL: number;
};

let priceCache: PriceCache | null = null;

export async function updateCryptoPrices() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`);
    }

    const data = await response.json();

    console.log("Updated Crypto Prices:", data);

    priceCache = {
      BTC: data.bitcoin.usd,
      ETH: data.ethereum.usd,
      SOL: data.solana.usd,
    };
  } catch (error) {
    console.warn("Failed to update crypto prices.");
  }
}

export function getCryptoPrice(crypto: keyof PriceCache): number {
  if (!priceCache) {
    throw new Error("Crypto prices are not loaded yet.");
  }

  return priceCache[crypto];
}
