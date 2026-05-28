"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  resolvedAt: string | null;
  autoAssignOnResolve: boolean;
  riskScore: number;
  riskBand: string | null;
  notes: string | null;
};

type NoteEntry = { text: string; savedAt: string };

function parseNotes(raw: string | null): NoteEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (e): e is NoteEntry =>
          e &&
          typeof e === "object" &&
          typeof e.text === "string" &&
          typeof e.savedAt === "string",
      );
    }
  } catch {
    // fall through to plain-string handling
  }
  return [{ text: raw, savedAt: "" }];
}

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

        if (!data.aiSummary) {
          try {
            const aiRes = await fetch(`/api/cases/${caseId}/ai-summary`, {
              method: "PATCH",
            });
            if (aiRes.ok) {
              const aiData = (await aiRes.json()) as CaseData;
              data.aiSummary = aiData.aiSummary;
            }
          } catch {
            // falls through to "No AI summary available."
          }
        }

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
    <div className="flex min-h-screen items-start justify-center bg-background">
      <div className="w-full max-w-4xl px-6 pt-12 pb-16">
        {/* Back navigation */}
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="h-9 cursor-pointer rounded-lg border border-yellow-400/20 bg-yellow-400/10 !px-7 text-sm text-yellow-200 hover:bg-yellow-400/20 hover:text-yellow-100"
          >
            <Link href="/transactions">← Back to Transactions</Link>
          </Button>
        </div>

        {/* Page title + status badge */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-lg font-semibold text-foreground">
              {caseId}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Case Details
            </p>
          </div>
          {state === "found" && caseData && (
            <div className="pt-1">
              <StatusBadge status={caseData.status} />
            </div>
          )}
        </div>

        {state === "loading" && (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        )}

        {state === "not-found" && (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">Case not found.</p>
          </div>
        )}

        {state === "error" && (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Failed to load case.
            </p>
          </div>
        )}

        {state === "found" && caseData && (
          <>
            <CaseDetails caseData={caseData} setCaseData={setCaseData} onUpdate={setCaseData} />
            <ResolveSection caseData={caseData} onUpdate={setCaseData} />
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

  if (escalated) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle>Escalate Case</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <span className="size-2 shrink-0 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-destructive">
              Case Escalated
            </span>
            {escalatedAt && (
              <span className="text-xs text-muted-foreground">· {escalatedAt}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle>Escalate Case</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <p className="flex-1 text-sm text-muted-foreground">
          Flag for senior compliance review
        </p>
        <Button
          variant="destructive"
          className="h-10 shrink-0 cursor-pointer !px-7"
          onClick={handleEscalate}
          disabled={submitting}
        >
          {submitting ? "Escalating…" : "Escalate Case"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CaseDetails({
  caseData,
  setCaseData,
  onUpdate,
}: {
  caseData: CaseData;
  setCaseData: (data: CaseData) => void;
  onUpdate: (data: CaseData) => void;
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
      {/* AI Summary */}
      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle>AI Summary</CardTitle>
          <CardAction>
            <Badge variant="secondary">AI Generated</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-7 text-foreground">
            {caseData.aiSummary ?? "No AI summary available."}
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-yellow-500 hover:text-yellow-400">
              ▸ Recommended Next Steps
            </summary>
            <div className="mt-3 whitespace-pre-line rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm text-foreground">
              {caseData.recommendedActions ?? "No recommended actions available."}
            </div>
          </details>
        </CardContent>
      </Card>

      <EscalateBar caseData={caseData} onUpdate={onUpdate} />

      {/* Message Customer */}
      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle>Message Customer</CardTitle>
          {messageSentAt && (
            <CardAction>
              <span className="text-xs text-muted-foreground">
                Sent at {messageSentAt}
              </span>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-4">
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
            {caseData.messageSent ? "Sent" : "Not sent"}
          </span>
          <Button
            className="h-10 cursor-pointer !px-7"
            onClick={handleSendMessage}
            disabled={caseData.messageSent || sending}
          >
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      {/* Case Details grid */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <dl className="divide-y divide-border/60">
          <DetailRow label="Case ID">
            <span className="font-mono text-sm text-foreground">
              {caseData.caseId}
            </span>
          </DetailRow>
          <DetailRow label="Risk Score">
            <span className="font-mono text-sm font-semibold text-foreground">
              {caseData.riskScore}
            </span>
          </DetailRow>
          <DetailRow label="Risk Band">
            <RiskBandBadge band={caseData.riskBand} />
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
      </Card>

      <NotesSection caseData={caseData} setCaseData={setCaseData} />
      <AuditLog caseData={caseData} />
    </>
  );
}

type AuditEvent = {
  key: string;
  timestamp: string;
  label: string;
  detail?: string;
  color: "blue" | "green" | "red" | "primary" | "muted";
};

const dotClasses: Record<AuditEvent["color"], string> = {
  blue: "bg-blue-400 ring-blue-400/30",
  green: "bg-green-400 ring-green-400/30",
  red: "bg-red-400 ring-red-400/30",
  primary: "bg-primary ring-primary/30",
  muted: "bg-muted-foreground ring-muted-foreground/30",
};

function buildAuditEvents(caseData: CaseData): AuditEvent[] {
  const events: AuditEvent[] = [];

  if (caseData.createdAt) {
    events.push({
      key: "created",
      timestamp: caseData.createdAt,
      label: "Case created",
      color: "blue",
    });
    events.push({
      key: "risk",
      timestamp: caseData.createdAt,
      label: "Risk score calculated",
      detail: `Score ${caseData.riskScore}${caseData.riskBand ? ` · Band ${caseData.riskBand}` : ""}`,
      color: "blue",
    });
  }

  if (caseData.assignedAt) {
    events.push({
      key: "assigned",
      timestamp: caseData.assignedAt,
      label: "Analyst assigned",
      detail: caseData.assignedEmail ?? caseData.assignedTo ?? undefined,
      color: "green",
    });
  }

  if (caseData.escalated && caseData.escalatedAt) {
    events.push({
      key: "escalated",
      timestamp: caseData.escalatedAt,
      label: "Case escalated",
      color: "red",
    });
  }

  if (caseData.messageSent && caseData.messageSentAt) {
    events.push({
      key: "message",
      timestamp: caseData.messageSentAt,
      label: "Message sent to customer",
      color: "primary",
    });
  }

  for (const [idx, note] of parseNotes(caseData.notes).entries()) {
    if (!note.savedAt) continue;
    events.push({
      key: `note-${idx}-${note.savedAt}`,
      timestamp: note.savedAt,
      label: "Note added",
      detail: note.text,
      color: "muted",
    });
  }

  if (caseData.status === "CLOSED" && caseData.resolvedAt) {
    events.push({
      key: "resolved",
      timestamp: caseData.resolvedAt,
      label: "Case resolved",
      color: "green",
    });
  }

  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function AuditLog({ caseData }: { caseData: CaseData }) {
  const events = buildAuditEvents(caseData);

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <ol className="relative ml-1 space-y-4 border-l border-border pl-5">
            {events.map((event) => (
              <li key={event.key} className="relative">
                <span
                  className={`absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full ring-4 ${dotClasses[event.color]}`}
                />
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-foreground">
                    {event.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                {event.detail && (
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                    {event.detail}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function NotesSection({
  caseData,
  setCaseData,
}: {
  caseData: CaseData;
  setCaseData: (data: CaseData) => void;
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const entries = parseNotes(caseData.notes);
  const sorted = [...entries].sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  );

  const handleSave = async () => {
    const text = draft.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseData.caseId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: text }),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as CaseData;
      setCaseData(updated);
      setDraft("");
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle>Notes</CardTitle>
        <CardAction>
          {showSaved && (
            <span className="text-xs font-medium text-green-400">✓ Saved</span>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Add a note about this case…"
          className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <div className="mt-2 flex justify-end">
          <Button
            className="h-10 cursor-pointer !px-7"
            onClick={handleSave}
            disabled={saving || !draft.trim()}
          >
            {saving ? "Saving…" : "Save Note"}
          </Button>
        </div>
        {sorted.length > 0 && (
          <>
            <div className="mt-4 border-t border-border/40" />
            <div className="mt-4 space-y-2.5">
              {sorted.map((entry, idx) => (
                <div
                  key={`${entry.savedAt}-${idx}`}
                  className="rounded-lg bg-muted/20 px-3 py-2.5"
                >
                  <div className="mb-1 text-xs text-muted-foreground">
                    {entry.savedAt
                      ? new Date(entry.savedAt).toLocaleString()
                      : "Previously saved"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
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
    <div className="flex items-center gap-6 px-4 py-3">
      <dt className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}

function RiskBandBadge({ band }: { band: string | null }) {
  if (!band) return <span className="text-sm text-muted-foreground">—</span>;

  const upper = band.toUpperCase();

  if (upper === "LOW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        <span className="size-1.5 rounded-full bg-green-400" />
        {band}
      </span>
    );
  }
  if (upper === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        {band}
      </span>
    );
  }
  if (upper === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
        <span className="size-1.5 rounded-full bg-orange-400" />
        {band}
      </span>
    );
  }
  if (upper === "CRITICAL" || upper === "RESTRICTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        {band}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      {band}
    </span>
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

function ResolveSection({
  caseData,
  onUpdate,
}: {
  caseData: CaseData;
  onUpdate: (data: CaseData) => void;
}) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  const [savingAutoAssign, setSavingAutoAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const resolved = caseData.status === "CLOSED";
  const resolvedAt = caseData.resolvedAt
    ? new Date(caseData.resolvedAt).toLocaleString()
    : null;

  const handleToggleAutoAssign = async (checked: boolean) => {
    setSavingAutoAssign(true);
    try {
      const res = await fetch(`/api/cases/${caseData.caseId}/auto-assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoAssignOnResolve: checked }),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as CaseData;
      onUpdate(updated);
    } finally {
      setSavingAutoAssign(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch(`/api/cases/${caseData.caseId}/resolve`, {
        method: "PATCH",
      });
      if (!res.ok) return;
      const updated = (await res.json()) as CaseData;
      onUpdate(updated);
    } finally {
      setResolving(false);
    }
  };

  const handleGetNewCase = async () => {
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch(`/api/cases/assign`, { method: "POST" });
      if (!res.ok) {
        setAssignError("Failed to assign a new case.");
        return;
      }
      const data = (await res.json()) as {
        alreadyAssigned?: boolean;
        noCases?: boolean;
        case: CaseData | null;
      };
      if (data.noCases || !data.case) {
        setAssignError("No open cases available.");
        return;
      }
      router.push(`/cases/${data.case.caseId}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle>Resolve Case</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 cursor-pointer rounded border-border bg-background accent-primary disabled:cursor-not-allowed"
            checked={caseData.autoAssignOnResolve}
            disabled={resolved || savingAutoAssign}
            onChange={(e) => handleToggleAutoAssign(e.target.checked)}
          />
          Auto-assign new case after resolving
        </label>

        {!resolved && (
          <div>
            <Button className="h-10 cursor-pointer !px-7" onClick={handleResolve} disabled={resolving}>
              {resolving ? "Resolving…" : "Resolve Case"}
            </Button>
          </div>
        )}

        {resolved && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
                <span className="size-1.5 rounded-full bg-green-400" />
                Case Resolved
              </span>
              {resolvedAt && (
                <span className="text-xs text-muted-foreground">
                  Resolved at {resolvedAt}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/transactions"
                className="inline-flex cursor-pointer items-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Transactions
              </Link>
              {caseData.autoAssignOnResolve && (
                <Button className="h-10 cursor-pointer !px-7" onClick={handleGetNewCase} disabled={assigning}>
                  {assigning ? "Assigning…" : "Get New Case"}
                </Button>
              )}
            </div>

            {assignError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {assignError}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
  if (status === "ESCALATED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        ESCALATED
      </span>
    );
  }
  if (status === "CLOSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        <span className="size-1.5 rounded-full bg-green-400" />
        CLOSED
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
