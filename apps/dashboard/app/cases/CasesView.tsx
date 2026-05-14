"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CasesView({ cases }: { cases: any[] }) {
  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-semibold">Cases</h1>

      {cases.length === 0 ? (
        <p className="text-muted-foreground">No cases found</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>{caseItem.caseId}</TableCell>
                  <TableCell>{caseItem.userId}</TableCell>
                  <TableCell>{caseItem.transactionId}</TableCell>
                  <TableCell>{caseItem.amount}</TableCell>
                  <TableCell>{caseItem.currency}</TableCell>
                  <TableCell>{caseItem.transactionType}</TableCell>
                  <TableCell>{caseItem.status}</TableCell>
                  <TableCell>{caseItem.reason || "-"}</TableCell>
                  <TableCell>
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
