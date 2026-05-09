import { NextResponse } from "next/server";
import { startPoller, getTransactions } from "@/lib/transactionPoller";

export async function GET() {
  startPoller();
  return NextResponse.json(getTransactions());
}
