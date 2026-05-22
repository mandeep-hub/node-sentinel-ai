import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analystId = session.user.email;
  const analystEmail = session.user.email;

  const existing = await prisma.case.findFirst({
    where: { assignedTo: analystEmail, status: "IN_REVIEW" },
  });
  if (existing) {
    return NextResponse.json({ alreadyAssigned: true, case: existing });
  }

  const openCases = await prisma.case.findMany({ where: { status: "OPEN" } });
  if (openCases.length === 0) {
    return NextResponse.json({ noCases: true, case: null });
  }

  const randomCase = openCases[Math.floor(Math.random() * openCases.length)];
  const assigned = await prisma.case.update({
    where: { id: randomCase.id },
    data: {
      assignedTo: analystEmail,
      assignedEmail: analystEmail,
      assignedAt: new Date(),
      status: "IN_REVIEW",
    },
  });

  return NextResponse.json({ alreadyAssigned: false, case: assigned });
}
