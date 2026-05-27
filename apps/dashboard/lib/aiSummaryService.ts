import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type CaseData = {
  transactionType: string;
  currency: string;
  amount: string;
  country: string | null;
  profession: string | null;
  escalated: boolean;
};

export async function generateAiSummary(caseData: CaseData) {
  const prompt = `
    You are an AML compliance analyst.
    
    Generate a professional AML risk summary in 2-3 sentences.
    
    Include:
    - transaction risk observations
    - customer risk profile
    - possible compliance concerns
    - whether enhanced due diligence may be needed
    
    Do NOT repeat the prompt.
    Do NOT use bullet points.
    
    Transaction Type: ${caseData.transactionType}
    Amount: ${caseData.currency} ${caseData.amount}
    Country: ${caseData.country}
    Profession: ${caseData.profession}
    Escalated: ${caseData.escalated}
    `;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "No AI summary generated.";
}
