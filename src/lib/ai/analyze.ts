import Anthropic from "@anthropic-ai/sdk";
import { ScrapedData, CompanyReport } from "../types";
import { buildAnalysisPrompt } from "./prompts";

const anthropic = new Anthropic();

export async function analyzeCompany(
  companyName: string,
  data: ScrapedData[]
): Promise<CompanyReport> {
  const prompt = buildAnalysisPrompt(companyName, data);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as CompanyReport;
}
