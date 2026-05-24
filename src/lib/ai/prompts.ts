import { ScrapedData } from "../types";

export function buildAnalysisPrompt(
  companyName: string,
  data: ScrapedData[]
): string {
  return `You are a career advisor specialized in the Portuguese job market, covering both IT/tech and business sectors (finance, consulting, marketing, HR, management).

Analyze the following data about "${companyName}" and generate a structured report.

## Collected Data
${JSON.stringify(data, null, 2)}

## Output Format (JSON only, no markdown wrapping)
{
  "overallScore": 7.5,
  "summary": "...",
  "companyOverview": {
    "size": "...",
    "founded": "...",
    "techStack": ["..."],
    "industry": "..."
  },
  "salary": {
    "it": {
      "junior": { "min": 0, "max": 0 },
      "mid": { "min": 0, "max": 0 },
      "senior": { "min": 0, "max": 0 }
    },
    "business": {
      "junior": { "min": 0, "max": 0 },
      "mid": { "min": 0, "max": 0 },
      "senior": { "min": 0, "max": 0 }
    },
    "currency": "EUR"
  },
  "culture": {
    "positiveKeywords": ["..."],
    "negativeKeywords": ["..."],
    "workLifeBalance": 7,
    "remoteFriendly": true
  },
  "interview": {
    "difficulty": 6,
    "process": "...",
    "commonQuestions": ["..."],
    "avgDuration": "2 weeks"
  },
  "redFlags": [
    {
      "issue": "...",
      "confidence": "high",
      "sources": ["teamlyzer", "glassdoor"],
      "mentions": 8
    }
  ],
  "greenFlags": ["..."],
  "foreignerFriendly": {
    "score": 7,
    "visaSupport": true,
    "englishEnvironment": "high",
    "internationalTeam": true,
    "relocationSupport": null,
    "notes": "..."
  },
  "reviewAuthenticity": {
    "score": 8,
    "totalReviews": 45,
    "suspiciousPatterns": false,
    "notes": "..."
  },
  "recommendation": "..."
}

Rules:
- Be objective and data-driven
- If data is insufficient for a field, set it to null
- Red flags: cross-validate across platforms. Only mark "high confidence" if mentioned by 2+ sources
- Detect suspicious review patterns (many 5-star reviews in short period, generic language)
- Foreigner-friendly assessment: extract from review text mentions of visa, English, international team, relocation
- Salary ranges should be annual gross in EUR
- Write summary and recommendation in English
- Score should reflect the overall picture, not just ratings
- Return ONLY valid JSON, no markdown code fences`;
}
