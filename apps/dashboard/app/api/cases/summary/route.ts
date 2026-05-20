import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const openCases = await prisma.case.count({
      where: {
        status: "OPEN",
      },
    });

    return NextResponse.json({
      openCases,
    });
  } catch (error) {
    console.error("Failed to retrieve case summary:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve case summary",
      },
      {
        status: 500,
      },
    );
  }
}
