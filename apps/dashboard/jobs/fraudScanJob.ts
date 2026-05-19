import { scanTransactions } from "@/lib/fraudScanner";

export function startFraudScanJob() {
  setInterval(async () => {
    try {
      await scanTransactions();

      console.log("Fraud scan completed");
    } catch (error) {
      console.error("Fraud scan failed:", error);
    }
  }, 10000);
}
