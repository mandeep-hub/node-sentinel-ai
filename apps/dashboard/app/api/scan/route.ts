import { scanTransactions } from "@/lib/fraudScanner";

export async function GET() {
  try {
    await scanTransactions();

    return Response.json({
      success: true,
      message: "Transaction scan completed",
    });
  } catch (error) {
    console.error("Fraud scan failed:", error);

    return Response.json(
      {
        success: false,
        error: "Fraud scan failed",
      },
      {
        status: 500,
      },
    );
  }
}
