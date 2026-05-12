import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MOCK_CASES } from "../mock-data";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = MOCK_CASES.find((c) => c.caseId === caseId);

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/cases">← Back to Cases</Link>
            </Button>
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Case not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases">← Back to Cases</Link>
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Case Details</h1>
          <StatusBadge status={caseData.status} />
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <dl className="divide-y divide-border">
            <DetailRow label="Case ID">
              <span className="font-mono text-sm text-foreground">{caseData.caseId}</span>
            </DetailRow>
            <DetailRow label="User ID">
              <span className="text-sm text-foreground">{caseData.userId}</span>
            </DetailRow>
            <DetailRow label="Amount">
              <span className="font-mono text-sm text-foreground">
                {caseData.currency}{" "}
                {caseData.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </DetailRow>
            <DetailRow label="Transaction ID">
              <span className="font-mono text-sm text-foreground">{caseData.transactionId}</span>
            </DetailRow>
            <DetailRow label="Currency">
              <span className="font-mono text-sm uppercase text-foreground">{caseData.currency}</span>
            </DetailRow>
            <DetailRow label="Type">
              <TypeBadge type={caseData.transactionType} />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={caseData.status} />
            </DetailRow>
          </dl>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6 px-6 py-4">
      <dt className="w-36 shrink-0 text-sm font-medium text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function TypeBadge({ type }: { type: "BUY" | "SELL" }) {
  if (type === "BUY") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        <span className="size-1.5 rounded-full bg-green-400" />
        BUY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      <span className="size-1.5 rounded-full bg-primary" />
      SELL
    </span>
  );
}

function StatusBadge({ status }: { status: "open" | "processing" | "closed" }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        open
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        <span className="size-1.5 rounded-full bg-blue-400" />
        processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      closed
    </span>
  );
}
