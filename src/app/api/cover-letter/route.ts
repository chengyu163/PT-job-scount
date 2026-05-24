import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiLanguage, Locale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    company,
    role,
    jobDescription,
    name,
    skills,
    experience,
    locale = "en",
  } = body as {
    company: string;
    role: string;
    jobDescription?: string;
    name: string;
    skills: string[];
    experience: string;
    locale: Locale;
  };

  if (!company || !role || !name) {
    return NextResponse.json({ error: "company, role, and name required" }, { status: 400 });
  }

  const lang = getAiLanguage(locale);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      coverLetter: getMockCoverLetter(name, role, company),
      format: "text",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });

    const prompt = `You are an expert career consultant. Write a professional, compelling cover letter.

Details:
- Candidate name: ${name}
- Target role: ${role}
- Target company: ${company}
- Key skills: ${skills.join(", ")}
- Experience summary: ${experience}
${jobDescription ? `- Job description: ${jobDescription}` : ""}

Write a cover letter in ${lang} that:
1. Opens with a strong hook (not "I am writing to apply for...")
2. Connects the candidate's experience to the role requirements
3. Shows knowledge of the company and Portuguese market context
4. Highlights 2-3 most relevant achievements with specifics
5. Closes with confidence and a clear call to action
6. Is concise (250-350 words)

Return ONLY valid JSON:
{
  "coverLetter": "The full cover letter text with proper paragraphs separated by \\n\\n",
  "highlights": ["Key points that make this letter strong"],
  "customizationTips": ["How to further personalize this letter"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      return NextResponse.json({
        coverLetter: getMockCoverLetter(name, role, company),
        highlights: [],
        customizationTips: [],
      });
    }

    const cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    return NextResponse.json({
      coverLetter: getMockCoverLetter(name, role, company),
      highlights: [],
      customizationTips: [],
    });
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

function getMockCoverLetter(name: string, role: string, company: string): string {
  return `Dear Hiring Manager,

What excites me most about the ${role} position at ${company} is the opportunity to contribute to a team that's shaping the Portuguese tech landscape.

With my background in software development and a passion for building impactful products, I bring both technical depth and a collaborative mindset. In my previous role, I led the migration of a legacy system to a modern architecture, reducing deployment time by 70% and improving team velocity significantly.

I'm particularly drawn to ${company}'s approach to innovation in the Portuguese market. Having researched your company culture and recent growth, I believe my experience aligns well with your current needs and team dynamics.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${company}'s continued success.

Best regards,
${name}`;
}
