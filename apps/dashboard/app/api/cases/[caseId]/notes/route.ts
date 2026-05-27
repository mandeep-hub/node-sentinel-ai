import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  try {
    const body = (await request.json()) as { notes?: unknown };
    const text = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    const existing = await prisma.case.findUnique({ where: { caseId } });
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    let entries: { text: string; savedAt: string }[] = [];
    if (existing.notes) {
      try {
        const parsed = JSON.parse(existing.notes);
        if (Array.isArray(parsed)) {
          entries = parsed.filter(
            (e): e is { text: string; savedAt: string } =>
              e &&
              typeof e === "object" &&
              typeof e.text === "string" &&
              typeof e.savedAt === "string",
          );
        } else if (typeof existing.notes === "string" && existing.notes.length > 0) {
          entries = [{ text: existing.notes, savedAt: existing.createdAt.toISOString() }];
        }
      } catch {
        entries = [{ text: existing.notes, savedAt: existing.createdAt.toISOString() }];
      }
    }

    entries.push({ text, savedAt: new Date().toISOString() });

    const updated = await prisma.case.update({
      where: { caseId },
      data: { notes: JSON.stringify(entries) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update notes:", error);
    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 },
    );
  }
}
