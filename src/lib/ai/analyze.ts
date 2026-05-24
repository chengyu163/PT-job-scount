import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedData, CompanyReport } from "../types";
import { buildAnalysisPrompt } from "./prompts";
import { getMockReport } from "./mock";

function extractJson(text: string): string {
  let start = -1;
  let depth = 0;
  let best = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        const candidate = text.substring(start, i + 1);
        if (candidate.length > best.length) best = candidate;
        start = -1;
      }
    }
  }
  return best;
}

export async function analyzeCompany(
  companyName: string,
  data: ScrapedData[]
): Promise<CompanyReport> {
  if (!process.env.GEMINI_API_KEY) {
    return getMockReport(companyName);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = buildAnalysisPrompt(companyName, data);
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned) as CompanyReport;
  } catch (error) {
    console.error("AI analysis failed, using mock:", error);
    return getMockReport(companyName);
  }
}
