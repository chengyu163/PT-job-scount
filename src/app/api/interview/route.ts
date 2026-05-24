import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { getAiLanguage, Locale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company, role, locale = "en" } = body as {
    company: string;
    role: string;
    locale: Locale;
  };

  if (!company || !role) {
    return NextResponse.json({ error: "company and role required" }, { status: 400 });
  }

  const lang = getAiLanguage(locale);

  // Try to get company report data for context
  let companyContext = "";
  try {
    const slug = company.toLowerCase().replace(/\s+/g, "-");
    const companyRecord = await prisma.company.findUnique({ where: { slug } });
    if (companyRecord) {
      const report = await prisma.report.findFirst({
        where: { companyId: companyRecord.id, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (report) {
        companyContext = `\n\nCompany report data:\n${report.aiSummary}`;
      }
      const rawData = await prisma.rawData.findMany({
        where: { companyId: companyRecord.id },
        orderBy: { scrapedAt: "desc" },
        take: 3,
      });
      if (rawData.length > 0) {
        const interviews = rawData
          .map((r) => (r.data as Record<string, unknown>).interviews)
          .filter(Boolean);
        if (interviews.length > 0) {
          companyContext += `\n\nInterview data from scrapers:\n${JSON.stringify(interviews)}`;
        }
      }
    }
  } catch {
    // Continue without company context
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(getMockInterview(role, company));
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });

    const prompt = `You are an expert career coach specializing in the Portuguese job market.

Generate comprehensive interview preparation for the role of "${role}" at "${company}" in Portugal.
${companyContext}

Return ONLY valid JSON (no markdown fences) with this structure:
{
  "company": "${company}",
  "role": "${role}",
  "overview": "Brief overview of what to expect in this interview",
  "technicalQuestions": [
    { "question": "...", "tip": "How to approach this question", "difficulty": "easy|medium|hard" }
  ],
  "behavioralQuestions": [
    { "question": "...", "tip": "..." }
  ],
  "companySpecific": [
    { "question": "...", "tip": "Why they ask this and how to answer" }
  ],
  "questionsToAsk": ["Smart questions the candidate should ask the interviewer"],
  "preparationTips": ["Specific preparation advice"],
  "commonMistakes": ["Things to avoid"],
  "salaryNegotiation": {
    "tips": ["..."],
    "marketRange": "Estimated salary range for this role in Portugal"
  }
}

Rules:
- Generate 5-8 technical questions relevant to the role
- Generate 4-6 behavioral questions
- Generate 3-4 company-specific questions based on available data
- Generate 3-5 questions the candidate should ask
- If company data is available, tailor questions to their tech stack, culture, and interview process
- Salary negotiation tips should be specific to Portugal market
- Write ALL content in ${lang}
- Return ONLY valid JSON`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      return NextResponse.json(getMockInterview(role, company));
    }

    const cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("Interview prep generation failed:", error);
    return NextResponse.json(getMockInterview(role, company));
  }
}

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

function getMockInterview(role: string, company: string) {
  return {
    company,
    role,
    overview: `Prepare for a ${role} interview at ${company}. Expect a mix of technical and behavioral questions.`,
    technicalQuestions: [
      { question: "Describe your experience with the main technologies listed in the job description.", tip: "Be specific with examples and metrics.", difficulty: "medium" },
      { question: "How do you approach system design for scalable applications?", tip: "Start with requirements, then discuss trade-offs.", difficulty: "hard" },
      { question: "Walk me through a challenging bug you debugged recently.", tip: "Use the STAR method and explain your thought process.", difficulty: "medium" },
    ],
    behavioralQuestions: [
      { question: "Tell me about a time you disagreed with a team decision.", tip: "Show maturity and collaboration skills." },
      { question: "How do you prioritize when everything seems urgent?", tip: "Discuss frameworks you use for prioritization." },
    ],
    companySpecific: [
      { question: `Why do you want to work at ${company}?`, tip: "Research the company values and recent news." },
      { question: "What interests you about the Portuguese market?", tip: "Show genuine interest in the local context." },
    ],
    questionsToAsk: [
      "What does a typical sprint look like for this team?",
      "How does the company support professional development?",
      "What are the biggest challenges the team is facing right now?",
    ],
    preparationTips: [
      "Research the company on Teamlyzer and Glassdoor for culture insights",
      "Prepare examples using the STAR method",
      "Practice explaining technical concepts simply",
    ],
    commonMistakes: [
      "Not researching Portuguese labor law basics (14 months salary, meal allowance)",
      "Focusing only on technical skills without showing cultural fit",
    ],
    salaryNegotiation: {
      tips: ["Know that Portugal offers 14 salary payments per year", "Meal allowance (up to ~€10.20/day) is tax-free"],
      marketRange: "€35,000 - €65,000 depending on seniority",
    },
  };
}
