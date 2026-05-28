"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/ui/LogoutButton";

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
  country: string | null;
  profession: string | null;
  createdAt: string;
  metadata: unknown;
  user: UserRef;
  creditCurrency: CurrencyRef | null;
  debitCurrency: CurrencyRef | null;
}

interface Case {
  id: string;
  caseId: string;
  status: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [openCases, setOpenCases] = useState(0);
  const caseLabel = openCases === 1 ? "case" : "cases";
  const verbLabel = openCases === 1 ? "is" : "are";
  const [assignedCase, setAssignedCase] = useState<Case | null>(null);

  const flaggedCount = transactions.filter((t) => t.flagReason !== null).length;

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TRANSACTION_ENGINE_URL}/transactions`,
      );

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

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

  const scanTransactions = async () => {
    try {
      const response = await fetch("/api/scan");

      if (!response.ok) {
        console.error("Scan API failed");
      }
    } catch (error) {
      console.error("Scan request failed:", error);
    }
  };

  const fetchOpenCases = useCallback(async () => {
    try {
      const res = await fetch("/api/cases/summary");

      if (!res.ok) {
        throw new Error("Failed to fetch open cases");
      }

      const data = await res.json();

      setOpenCases(data.openCases);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch open cases",
      );
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchOpenCases();

    scanTransactions();

    const interval = setInterval(() => {
      fetchTransactions();
      fetchOpenCases();
      scanTransactions();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchTransactions, fetchOpenCases]);

  const requestCase = async () => {
    try {
      const res = await fetch("/api/cases/assign", { method: "POST" });
      const data = await res.json();

      if (data.alreadyAssigned) {
        toast.info("You already have an active case.");
        setAssignedCase(data.case);
      } else if (data.noCases) {
        toast.info("No open cases available.");
      } else {
        toast.success(`Case ${data.case.caseId} assigned to you.`);
        setAssignedCase(data.case);
        fetchOpenCases();
      }
    } catch {
      toast.error("Failed to request a case.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-foreground">
                Transactions
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-green-400" />
                </span>
                Live
              </span>
            </div>
            {lastUpdated && (
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Case queue action bar */}
        <Card className="mb-8">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 items-center rounded-lg border border-yellow-400/30 bg-yellow-400/90 px-4 text-sm font-medium text-black">
                {openCases === 0
                  ? "No open cases"
                  : `${openCases} open ${caseLabel}`}
              </span>

              {assignedCase ? (
                <Button
                  className="h-9 rounded-lg bg-yellow-500 px-4 text-sm font-semibold text-black hover:bg-yellow-400"
                  asChild
                >
                  <a href={`/cases/${assignedCase.caseId}`}>View my case →</a>
                </Button>
              ) : (
                <Button
                  onClick={requestCase}
                  className="h-9 rounded-lg bg-yellow-500 px-4 text-sm font-semibold text-black hover:bg-yellow-400"
                >
                  Request new case
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction table */}
        {loading && transactions.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Loading transactions…
            </p>
          </div>
        ) : transactions.length === 0 && !error ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              No transactions found.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{transactions.length.toLocaleString()} transactions</span>
              {flaggedCount > 0 && (
                <>
                  <span>·</span>
                  <span className="font-medium text-destructive">
                    {flaggedCount} flagged
                  </span>
                </>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tx ID
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      User
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Type
                    </th>

                    <th className="w-36 min-w-36 max-w-36 px-4 py-3 text-right font-medium text-muted-foreground">
                      Debit
                    </th>

                    <th className="w-36 min-w-36 max-w-36 px-4 py-3 text-right font-medium text-muted-foreground border-r border-border">
                      Credit
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Country
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Profession
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
                          {tx.id.length > 12
                            ? `${tx.id.slice(0, 12)}…`
                            : tx.id}
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

                        <td className="w-36 min-w-36 max-w-36 whitespace-nowrap px-4 py-3 text-right font-mono text-foreground border-r border-border">
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

                        <td className="px-4 py-3 text-xs uppercase text-muted-foreground">
                          {tx.country ?? "—"}
                        </td>

                        <td
                          className="max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 text-xs text-muted-foreground"
                          title={tx.profession ?? undefined}
                        >
                          {tx.profession ?? "—"}
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
          </>
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
    return <StatusPill tone="green">Bought {tx.creditCurrencyCode}</StatusPill>;
  }

  if (credit?.kind === "fiat" && debit?.kind === "crypto") {
    return <StatusPill tone="primary">Sold {tx.debitCurrencyCode}</StatusPill>;
  }

  if (tx.kind === "deposit") {
    return <StatusPill tone="blue">Deposit</StatusPill>;
  }

  if (tx.kind === "withdrawal") {
    return <StatusPill tone="orange">Withdrawal</StatusPill>;
  }

  return (
    <StatusPill tone="muted">
      Swap {tx.debitCurrencyCode} → {tx.creditCurrencyCode}
    </StatusPill>
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
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
          title={flagReason ?? undefined}
        >
          <span aria-hidden>⚠</span>
          Flagged
        </span>
        {flagReason && (
          <p className="mt-0.5 max-w-[14rem] truncate text-xs text-destructive/70">
            {flagReason}
          </p>
        )}
      </div>
    );
  }

  if (status === "settled") {
    return <StatusPill tone="green">Settled</StatusPill>;
  }

  if (status === "pending") {
    return <StatusPill tone="orange">Pending</StatusPill>;
  }

  if (status === "reversed") {
    return <StatusPill tone="muted">Reversed</StatusPill>;
  }

  return <StatusPill tone="muted">{status}</StatusPill>;
}

type Tone = "green" | "primary" | "blue" | "orange" | "muted";

function StatusPill({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
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
