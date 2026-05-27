import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAiSummary } from "@/lib/aiSummaryService";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  try {
    const existing = await prisma.case.findUnique({ where: { caseId } });
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const fallback = `A high-value ${existing.transactionType} transaction involving ${existing.currency} ${existing.amount} exceeded AML monitoring thresholds and requires additional compliance review.`;

    let aiSummary = fallback;
    try {
      aiSummary = await generateAiSummary({
        transactionType: existing.transactionType,
        currency: existing.currency,
        amount: existing.amount.toString(),
        country: existing.country,
        profession: existing.profession,
        escalated: existing.escalated,
      });
    } catch {
      // use fallback
    }

    const updated = await prisma.case.update({
      where: { caseId },
      data: { aiSummary },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to generate AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 },
    );
  }
}
