import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const updated = await prisma.case.update({
      where: { caseId },
      data: { status: "CLOSED", resolvedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to resolve case:", error);
    return NextResponse.json(
      { error: "Failed to resolve case" },
      { status: 500 },
    );
  }
}
