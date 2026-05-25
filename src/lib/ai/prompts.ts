import { ScrapedData } from "../types";
import { Locale, getAiLanguage } from "../i18n";

export function buildAnalysisPrompt(
  companyName: string,
  data: ScrapedData[],
  locale: Locale = "en"
): string {
  const lang = getAiLanguage(locale);

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
    "roles": [
      { "role": "Software Engineer", "min": 35000, "max": 55000, "source": "teamlyzer" }
    ],
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
  "openPositions": [
    {
      "title": "Senior Software Engineer",
      "source": "indeed",
      "location": "Lisboa",
      "remote": false,
      "salaryRange": "€50,000 - €70,000"
    }
  ],
  "hiringTrends": {
    "isHiring": true,
    "totalOpenings": 5,
    "topRoles": ["Software Engineer", "Product Manager"],
    "techDemand": ["React", "Java", "AWS"],
    "notes": "..."
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
- salary.roles: ONLY include roles with actual salary data from the scraped sources. Do NOT estimate or infer salaries. Each entry must have the source it came from. Annual gross in EUR
- openPositions: list all unique job openings found across sources, with estimated salary if available
- hiringTrends: analyze job data to determine hiring activity, most demanded roles and technologies
- IMPORTANT: Write ALL text content (summary, recommendation, redFlags issues, greenFlags, culture keywords, interview process, foreignerFriendly notes, reviewAuthenticity notes, hiringTrends notes, openPositions salaryRange) in ${lang}
- Score should reflect the overall picture, not just ratings
- Return ONLY valid JSON, no markdown code fences`;
}
