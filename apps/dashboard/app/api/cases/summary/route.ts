import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth0.getSession();
    const analystEmail = session?.user?.email ?? null;

    const openCases = await prisma.case.count({
      where: {
        status: "OPEN",
      },
    });

    const myCases = analystEmail
      ? await prisma.case.count({
          where: {
            assignedTo: analystEmail,
            status: { in: ["IN_REVIEW", "ESCALATED"] },
          },
        })
      : 0;

    return NextResponse.json({
      openCases,
      myCases,
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
