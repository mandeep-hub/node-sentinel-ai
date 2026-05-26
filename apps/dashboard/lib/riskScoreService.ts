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

type Case = { status: "OPEN" | "IN_REVIEW" | "CLOSED"; riskScore: number };

export function calculateRiskScore(
  country: string,
  profession: string,
  cases: Case[],
) {
  if (sanctionedCountries.includes(country)) {
    return { riskBand: "RESTRICTED", riskScore: 100 };
  }

  let totalScore = 2;
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
  if (openCasesCount >= 2) {
    openCasesScore += 3;
  } else if (openCasesCount === 1) {
    openCasesScore += 1;
  }

  const hasHighRiskreviewCase = reviewCases.some((c) => c.riskScore > 40);
  let reviewCasesScore = 0;
  if (hasHighRiskreviewCase) {
    reviewCasesScore += 8;
  } else if (reviewCasesCount > 1) {
    reviewCasesScore += 6;
  } else if (reviewCasesCount === 1) {
    reviewCasesScore += 4;
  }

  totalScore += professionScore + openCasesScore + reviewCasesScore;

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
