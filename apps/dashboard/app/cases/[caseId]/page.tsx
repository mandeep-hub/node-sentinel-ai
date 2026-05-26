"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type CaseData = {
  id: string;
  caseId: string;
  transactionId: string;
  userId: string;
  amount: string;
  currency: string;
  transactionType: string;
  status: string;
  reason: string;
  aiSummary?: string | null;

  recommendedActions?: string | null;
  country: string | null;
  profession: string | null;
  createdAt: string;
  assignedAt: string | null;
  assignedTo: string | null;
  assignedEmail: string | null;
  messageSent: boolean;
  messageSentAt: string | null;
  escalated: boolean;
  escalatedAt: string | null;
};

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [state, setState] = useState<
    "loading" | "found" | "not-found" | "error"
  >("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cases/${caseId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setState("not-found");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = (await res.json()) as CaseData;

        const actions: string[] = [];

        actions.push("- Contact customer");

        actions.push("- Verify source of funds");

        if (data.escalated) {
          data.aiSummary =
            (data.aiSummary ?? "") +
            " The case has already been escalated for additional compliance investigation.";
        }

        if (
          data.country === "KP" ||
          data.country === "IR" ||
          data.country === "RU"
        ) {
          actions.push(
            "- Perform enhanced due diligence for high-risk country",
          );
        }

        if (
          data.profession?.toLowerCase().includes("crypto") ||
          data.profession?.toLowerCase().includes("commodities")
        ) {
          actions.push("- Review business activity and transaction history");
        }

        if (
          data.currency === "BTC" ||
          data.currency === "ETH" ||
          data.currency === "SOL"
        ) {
          actions.push("- Review crypto wallet activity");
        }

        data.recommendedActions = actions.join("\n");

        setCaseData(data);

        setState("found");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">← Back to Transactions</Link>
          </Button>
        </div>

        {state === "loading" && (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        )}

        {state === "not-found" && (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Case not found.</p>
          </div>
        )}

        {state === "error" && (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Failed to load case.
            </p>
          </div>
        )}

        {state === "found" && caseData && (
          <>
            <EscalateBar caseData={caseData} onUpdate={setCaseData} />
            <CaseDetails caseData={caseData} setCaseData={setCaseData} />
          </>
        )}
      </div>
    </div>
  );
}

function EscalateBar({
  caseData,
  onUpdate,
}: {
  caseData: CaseData;
  onUpdate: (data: CaseData) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const escalated = caseData.escalated;
  const escalatedAt = caseData.escalatedAt
    ? new Date(caseData.escalatedAt).toLocaleString()
    : null;

  const handleEscalate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseData.caseId}/escalate`, {
        method: "PATCH",
      });
      if (!res.ok) return;
      const updated = (await res.json()) as CaseData;
      onUpdate(updated);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <Button
        variant="destructive"
        onClick={handleEscalate}
        disabled={escalated || submitting}
      >
        {escalated
          ? "Case Escalated"
          : submitting
            ? "Escalating…"
            : "Escalate Case"}
      </Button>
      {escalated && escalatedAt && (
        <span className="text-sm text-muted-foreground">
          Escalated at {escalatedAt}
        </span>
      )}
    </div>
  );
}

function CaseDetails({
  caseData,
  setCaseData,
}: {
  caseData: CaseData;
  setCaseData: (data: CaseData) => void;
}) {
  const amount = Number(caseData.amount);
  const createdAt = new Date(caseData.createdAt).toLocaleString();
  const assignedAt = caseData.assignedAt
    ? new Date(caseData.assignedAt).toLocaleString()
    : null;
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/cases/${caseData.caseId}/message`, {
        method: "PATCH",
      });
      if (!res.ok) return;
      const updated = (await res.json()) as CaseData;
      setCaseData(updated);
    } finally {
      setSending(false);
    }
  };

  const messageSentAt = caseData.messageSentAt
    ? new Date(caseData.messageSentAt).toLocaleString()
    : null;

  return (
    <>
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          AI Summary
        </h2>

        <p className="whitespace-pre-line text-sm leading-7 text-foreground">
          {caseData.aiSummary ?? "No AI summary available."}
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-yellow-500">
            Recommended Next Steps
          </summary>

          <div className="mt-3 whitespace-pre-line rounded-md bg-muted p-3 text-sm text-foreground">
            {caseData.recommendedActions ?? "No recommended actions available."}
          </div>
        </details>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Case Details</h1>
      </div>

      <div className="mb-4 flex items-center gap-4 rounded-lg border border-border bg-card px-6 py-4">
        <span className="text-sm font-medium text-muted-foreground">
          Message Customer
        </span>
        <span
          className={
            caseData.messageSent
              ? "inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400"
              : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          <span
            className={
              caseData.messageSent
                ? "size-1.5 rounded-full bg-green-400"
                : "size-1.5 rounded-full bg-muted-foreground"
            }
          />
          {caseData.messageSent ? "Yes" : "No"}
        </span>
        {messageSentAt && (
          <span className="text-xs text-muted-foreground">{messageSentAt}</span>
        )}
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={caseData.messageSent || sending}
          >
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <dl className="divide-y divide-border">
          <DetailRow label="Case ID">
            <span className="font-mono text-sm text-foreground">
              {caseData.caseId}
            </span>
          </DetailRow>
          <DetailRow label="User ID">
            <span className="text-sm text-foreground">{caseData.userId}</span>
          </DetailRow>
          <DetailRow label="Amount">
            <span className="font-mono text-sm text-foreground">
              {caseData.currency}{" "}
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </span>
          </DetailRow>
          <DetailRow label="Transaction ID">
            <span className="font-mono text-sm text-foreground">
              {caseData.transactionId}
            </span>
          </DetailRow>
          <DetailRow label="Currency">
            <span className="font-mono text-sm uppercase text-foreground">
              {caseData.currency}
            </span>
          </DetailRow>
          <DetailRow label="Type">
            <TypeBadge type={caseData.transactionType} />
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={caseData.status} />
          </DetailRow>
          <DetailRow label="Reason">
            <span className="text-sm text-foreground">{caseData.reason}</span>
          </DetailRow>
          <DetailRow label="Country">
            <span className="text-sm text-foreground">
              {caseData.country ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Profession">
            <span className="text-sm text-foreground">
              {caseData.profession ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Assigned To">
            <span className="text-sm text-foreground">
              {caseData.assignedTo ?? (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Assigned At">
            <span className="text-sm text-foreground">
              {assignedAt ?? <span className="text-muted-foreground">—</span>}
            </span>
          </DetailRow>
          <DetailRow label="Created At">
            <span className="text-sm text-foreground">{createdAt}</span>
          </DetailRow>
        </dl>
      </div>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-6 px-6 py-4">
      <dt className="w-36 shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === "deposit") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        <span className="size-1.5 rounded-full bg-blue-400" />
        deposit
      </span>
    );
  }
  if (type === "withdrawal") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
        <span className="size-1.5 rounded-full bg-orange-400" />
        withdrawal
      </span>
    );
  }
  if (type === "trade") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        <span className="size-1.5 rounded-full bg-green-400" />
        trade
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "OPEN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        OPEN
      </span>
    );
  }
  if (status === "IN_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        <span className="size-1.5 rounded-full bg-blue-400" />
        IN_REVIEW
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      {status}
    </span>
  );
}
