"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  userId: number;
  transactionType: "BUY" | "SELL";
  cryptoType: "BTC" | "ETH" | "SOL";
  fiatAmount: number;
  cryptoAmount: number;
  currency: string;
  country: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5100/transactions");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setTransactions(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 40_000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setLoading(true);
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Transactions
            </h1>
            {lastUpdated && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && transactions.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Loading transactions…
            </p>
          </div>
        ) : transactions.length === 0 && !error ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              No transactions found.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Crypto
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Fiat Amount
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Crypto Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-border last:border-0 ${
                      i % 2 === 0 ? "bg-card" : "bg-muted/10"
                    } transition-colors hover:bg-muted/20`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {tx.id.length > 12 ? `${tx.id.slice(0, 12)}…` : tx.id}
                    </td>
                    <td className="px-4 py-3 text-foreground">{tx.userId}</td>
                    <td className="px-4 py-3">
                      <TypeBadge type={tx.transactionType} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                        {tx.cryptoType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {Number(tx.fiatAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {Number(tx.cryptoAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase">
                      {tx.currency}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground uppercase">
                      {tx.country}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: "BUY" | "SELL" | string }) {
  if (type === "BUY") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        <span className="size-1.5 rounded-full bg-green-400" />
        BUY
      </span>
    );
  }
  if (type === "SELL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        SELL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {type}
    </span>
  );
}
