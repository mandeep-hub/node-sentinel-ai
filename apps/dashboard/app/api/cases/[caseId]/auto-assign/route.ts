import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  try {
    const body = (await request.json()) as { autoAssignOnResolve?: boolean };
    if (typeof body.autoAssignOnResolve !== "boolean") {
      return NextResponse.json(
        { error: "autoAssignOnResolve must be a boolean" },
        { status: 400 },
      );
    }

    const existing = await prisma.case.findUnique({ where: { caseId } });
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const updated = await prisma.case.update({
      where: { caseId },
      data: { autoAssignOnResolve: body.autoAssignOnResolve },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update auto-assign:", error);
    return NextResponse.json(
      { error: "Failed to update auto-assign" },
      { status: 500 },
    );
  }
}
