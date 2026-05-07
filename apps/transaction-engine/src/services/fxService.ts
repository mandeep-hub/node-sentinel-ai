export async function getCryptoPrice(crypto: string): Promise<number> {
  const cryptoMap: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
  };

  const coinId = cryptoMap[crypto];

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
  );

  const data = await response.json();

  return data[coinId].usd;
}
