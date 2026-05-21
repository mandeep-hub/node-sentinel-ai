import { prisma } from "./prisma";

export async function assignCase(analystId: string, analystEmail: string) {
  // analyst already has an active case
  const existing = await prisma.case.findFirst({
    where: { assignedTo: analystId, status: "IN_REVIEW" },
  });
  if (existing) return { alreadyAssigned: true, case: existing };

  // no open cases in the queue
  const openCases = await prisma.case.findMany({
    where: { status: "OPEN" },
  });
  if (openCases.length === 0) return { noCases: true, case: null };

  // pick a random open case and assign it
  const randomCase = openCases[Math.floor(Math.random() * openCases.length)];
  const assigned = await prisma.case.update({
    where: { id: randomCase.id },
    data: {
      assignedTo: analystId,
      assignedAt: new Date(),
      status: "IN_REVIEW",
    },
  });

  return { alreadyAssigned: false, case: assigned };
}
