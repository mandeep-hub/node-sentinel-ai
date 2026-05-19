export async function fetchTransactions() {
  const response = await fetch("http://localhost:5100/transactions");

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}
