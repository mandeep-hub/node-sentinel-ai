import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { createCaseForSuspiciousTransaction } from "@/lib/caseService";
import { getExchangeRates } from "@/lib/exchangeRateService";

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      where: { status: "OPEN" },

      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Failed to retrieve cases:", error);

    return NextResponse.json(
      { error: "Failed to retrieve cases" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rates = await getExchangeRates();

    const createdCase = await createCaseForSuspiciousTransaction(body, rates);

    return NextResponse.json(createdCase);
  } catch (error) {
    console.error("Failed to create case:", error);

    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 },
    );
  }
}
