const sanctionedCountries = ["IR", "KP"];
const highRiskCountries = ["NG"];
const mediumRiskCountries = ["BR", "TR", "AE", "IN"];

const professionScores: Record<string, number> = {
  "Salaried professional": 0,
  "Self-employed / business owner": 2,
  "Import / export or e-commerce": 3,
  "Real estate": 4,
  "Crypto or financial services": 5,
  "Precious metals or commodities": 5,
  "Gambling, adult, arms, or cash-intensive business": 7,
  "Unclear activity": 10,
};

type Case = {
  status: "OPEN" | "IN_REVIEW" | "CLOSED";
  riskScore: number;
  amount: any;
  createdAt: Date;
  transactionType: "deposit" | "withdrawal" | "trade";
};

export function calculateRiskScore(
  country: string,
  profession: string,
  cases: Case[],
) {
  if (sanctionedCountries.includes(country)) {
    return { riskBand: "RESTRICTED", riskScore: 100 };
  }

  let totalScore = 2; //retail individual default score
  if (highRiskCountries.includes(country)) {
    totalScore += 6;
  }
  if (mediumRiskCountries.includes(country)) {
    totalScore += 3;
  }

  const professionScore = professionScores[profession] ?? 0;

  const openCases = cases.filter((c) => c.status === "OPEN");
  const openCasesCount = openCases.length;
  const reviewCases = cases.filter((c) => c.status === "IN_REVIEW");
  const reviewCasesCount = reviewCases.length;

  let openCasesScore = 0;
  if (openCasesCount === 1) {
    openCasesScore = 1;
  } else if (openCasesCount >= 2) {
    openCasesScore = 3;
  }

  const hasHighRiskReviewCase = reviewCases.some((c) => c.riskScore > 40);
  let reviewCasesScore = 0;
  if (hasHighRiskReviewCase) {
    reviewCasesScore += 8;
  } else if (reviewCasesCount > 1) {
    reviewCasesScore += 6;
  } else if (reviewCasesCount === 1) {
    reviewCasesScore += 4;
  }

  const casesScore = openCasesScore + reviewCasesScore;

  let patternRiskScore = 0;
  const roundAmountCount = openCases.filter(
    (c) => Number(c.amount) % 1000 === 0,
  ).length;
  const hasRepeatedRoundAmount = roundAmountCount >= 2;
  if (hasRepeatedRoundAmount) patternRiskScore += 2;

  const nearThresholdCount = openCases.filter(
    (c) => Number(c.amount) >= 8000 && Number(c.amount) < 10000,
  ).length;
  if (nearThresholdCount > 3) patternRiskScore += 4;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastSevenDaysCases = openCases.filter(
    (c) => new Date(c.createdAt) >= sevenDaysAgo,
  );

  const deposits = lastSevenDaysCases.filter(
    (c) => c.transactionType === "deposit" && Number(c.amount) % 1000 === 0,
  );

  const withdrawals = lastSevenDaysCases.filter(
    (c) => c.transactionType === "withdrawal" && Number(c.amount) % 1000 === 0,
  );

  const trades = lastSevenDaysCases.filter(
    (c) => c.transactionType === "trade" && Number(c.amount) % 1000 === 0,
  );

  if (deposits.length >= 5 || withdrawals.length >= 5 || trades.length >= 5) {
    patternRiskScore += 4;
  }

  totalScore += professionScore + casesScore + patternRiskScore;

  let riskBand = "LOW";
  if (totalScore >= 81) {
    riskBand = "RESTRICTED";
  } else if (totalScore >= 61) {
    riskBand = "CRITICAL";
  } else if (totalScore >= 41) {
    riskBand = "HIGH";
  } else if (totalScore >= 21) {
    riskBand = "MEDIUM";
  }
  return { riskBand, riskScore: totalScore };
}
