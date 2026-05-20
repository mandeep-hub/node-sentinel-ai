"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";

interface CurrencyRef {
  code: string;
  kind: string;
  decimals: number;
}

interface UserRef {
  id: string;
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  userId: string;
  kind: string;
  creditCurrencyCode: string | null;
  creditAmount: string | null;
  debitCurrencyCode: string | null;
  debitAmount: string | null;
  status: string;
  flaggedAt: string | null;
  flagReason: string | null;
  createdAt: string;
  metadata: unknown;
  user: UserRef;
  creditCurrency: CurrencyRef | null;
  debitCurrency: CurrencyRef | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [openCases, setOpenCases] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TRANSACTION_ENGINE_URL}/transactions`,
      );
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
  const fetchCaseSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/cases/summary");

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      setOpenCases(data.openCases);
    } catch (error) {
      console.error("Failed to fetch case summary:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchCaseSummary();

    const interval = setInterval(() => {
      fetchTransactions();
      fetchCaseSummary();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchTransactions, fetchCaseSummary]);

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
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
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <button className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700">
              Request new case →
            </button>

            <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground shadow-sm">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              {openCases} open cases
            </div>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            There are {openCases} cases open — request one to work on.
          </p>
        </div>

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
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Kind
                  </th>
                  <th className="w-36 min-w-36 max-w-36 px-4 py-3 text-right font-medium text-muted-foreground">
                    Debit
                  </th>
                  <th className="w-36 min-w-36 max-w-36 px-4 py-3 text-right font-medium text-muted-foreground">
                    Credit
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const flagged = tx.flagReason !== null;
                  const zebra = i % 2 === 0 ? "bg-card" : "bg-muted/10";
                  const rowClass = flagged
                    ? "border-l-2 border-l-destructive bg-destructive/5"
                    : zebra;
                  return (
                    <motion.tr
                      key={tx.id}
                      className={`border-b border-border last:border-0 ${rowClass} transition-colors hover:bg-muted/20`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {tx.id.length > 12 ? `${tx.id.slice(0, 12)}…` : tx.id}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {tx.user.name}
                      </td>
                      <td className="px-4 py-3">
                        <KindBadge tx={tx} />
                      </td>
                      <td className="w-36 min-w-36 max-w-36 whitespace-nowrap px-4 py-3 text-right font-mono text-foreground">
                        <AmountCell
                          amount={tx.debitAmount}
                          currency={tx.debitCurrency}
                        />
                      </td>
                      <td className="w-36 min-w-36 max-w-36 whitespace-nowrap px-4 py-3 text-right font-mono text-foreground">
                        <AmountCell
                          amount={tx.creditAmount}
                          currency={tx.creditCurrency}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={tx.status}
                          flagReason={tx.flagReason}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AmountCell({
  amount,
  currency,
}: {
  amount: string | null;
  currency: CurrencyRef | null;
}) {
  if (amount === null || currency === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const value = parseFloat(amount);
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(currency.decimals, 8),
    maximumFractionDigits: Math.min(currency.decimals, 8),
  });
  return (
    <span>
      {formatted}{" "}
      <span className="text-xs text-muted-foreground">{currency.code}</span>
    </span>
  );
}

function KindBadge({ tx }: { tx: Transaction }) {
  const credit = tx.creditCurrency;
  const debit = tx.debitCurrency;

  if (credit?.kind === "crypto" && debit?.kind === "fiat") {
    return <Badge tone="green">Bought {tx.creditCurrencyCode}</Badge>;
  }
  if (credit?.kind === "fiat" && debit?.kind === "crypto") {
    return <Badge tone="primary">Sold {tx.debitCurrencyCode}</Badge>;
  }
  if (tx.kind === "deposit") {
    return <Badge tone="blue">Deposit</Badge>;
  }
  if (tx.kind === "withdrawal") {
    return <Badge tone="orange">Withdrawal</Badge>;
  }
  return (
    <Badge tone="muted">
      Swap {tx.debitCurrencyCode} → {tx.creditCurrencyCode}
    </Badge>
  );
}

function StatusBadge({
  status,
  flagReason,
}: {
  status: string;
  flagReason: string | null;
}) {
  if (status === "flagged" || flagReason) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
        title={flagReason ?? undefined}
      >
        <span aria-hidden>⚠</span>
        {status}
      </span>
    );
  }
  if (status === "settled") {
    return <Badge tone="green">settled</Badge>;
  }
  if (status === "pending") {
    return <Badge tone="orange">pending</Badge>;
  }
  if (status === "reversed") {
    return <Badge tone="muted">reversed</Badge>;
  }
  return <Badge tone="muted">{status}</Badge>;
}

type Tone = "green" | "primary" | "blue" | "orange" | "muted";

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const styles: Record<Tone, string> = {
    green: "bg-green-500/10 text-green-400 before:bg-green-400",
    primary: "bg-primary/10 text-primary before:bg-primary",
    blue: "bg-sky-500/10 text-sky-400 before:bg-sky-400",
    orange: "bg-orange-500/10 text-orange-400 before:bg-orange-400",
    muted: "bg-muted text-muted-foreground before:bg-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]} before:size-1.5 before:rounded-full before:content-['']`}
    >
      {children}
    </span>
  );
}
