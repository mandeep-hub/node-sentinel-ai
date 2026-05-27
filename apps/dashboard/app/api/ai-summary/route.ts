import { NextResponse } from "next/server";
import { generateAiSummary } from "@/lib/aiSummaryService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const summary = await generateAiSummary(body);

    return NextResponse.json({
      summary,
    });
  } catch (error) {
    console.warn("Gemini quota exceeded. Using fallback AI summary.");

    return NextResponse.json(
      {
        summary: "FALLBACK SUMMARY ACTIVATED - GEMINI FAILED",
      },
      {
        status: 200,
      },
    );
  }
}
