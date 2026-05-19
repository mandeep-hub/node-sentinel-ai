export async function fetchTransactions() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TRANSACTION_ENGINE_URL}/transactions`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}
