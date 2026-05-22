import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
