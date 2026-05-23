import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  try {
    const caseData = await prisma.case.findUnique({ where: { caseId } });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Failed to retrieve case:", error);
    return NextResponse.json(
      { error: "Failed to retrieve case" },
      { status: 500 },
    );
  }
}
