const ENGINE_URL = "http://localhost:5001";
const POLL_INTERVAL_MS = 30_000;

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
let lastId = 0;
let running = false;

async function poll(): Promise<void> {
  try {
    const url = `${ENGINE_URL}/transactions?fromId=${lastId}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const incoming: Transaction[] = await res.json();
    if (incoming.length > 0) {
      transactions.push(...incoming);
      lastId = incoming[incoming.length - 1].id;
    }
  } catch {
    // network errors are swallowed so the poller keeps running
  }
}

export function startPoller(): void {
  if (running) return;
  running = true;
  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

export function getTransactions(): Transaction[] {
  return transactions;
}
