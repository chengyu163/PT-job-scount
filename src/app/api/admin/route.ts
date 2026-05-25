import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aggregateData } from "@/lib/scrapers";
import { analyzeCompany } from "@/lib/ai/analyze";
import { closeBrowser } from "@/lib/scrapers/browser";
import { Locale } from "@/lib/i18n";

const CACHE_DAYS = 7;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET: list all companies with their status
export async function GET() {
  const companies = await prisma.company.findMany({
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      rawData: {
        orderBy: { scrapedAt: "desc" },
        take: 1,
        select: { scrapedAt: true, source: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const result = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    lastReport: c.reports[0]?.createdAt || null,
    reportExpired: c.reports[0] ? new Date(c.reports[0].expiresAt) < new Date() : true,
    score: c.reports[0]?.overallScore || null,
    lastScraped: c.rawData[0]?.scrapedAt || null,
  }));

  return NextResponse.json({ companies: result });
}

// POST: trigger scrape + report for a company
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company, lang = "zh" } = body as { company: string; lang?: Locale };

  if (!company) {
    return NextResponse.json({ error: "company required" }, { status: 400 });
  }

  const slug = slugify(company);

  try {
    console.log(`[admin] Starting scrape for ${company}...`);
    const scrapedData = await aggregateData(company);

    const hasData = scrapedData.some(
      (d) =>
        (d.ratings && d.ratings.overall > 0) ||
        (d.reviews && d.reviews.length > 0) ||
        (d.jobs && d.jobs.length > 0) ||
        (d.salaries && d.salaries.length > 0) ||
        d.companyInfo
    );

    if (!hasData) {
      return NextResponse.json({ error: "No data found", company }, { status: 404 });
    }

    console.log(`[admin] Analyzing ${company} with AI...`);
    const report = await analyzeCompany(company, scrapedData, lang);

    const companyRecord = await prisma.company.upsert({
      where: { slug },
      create: { name: company, slug },
      update: { name: company, updatedAt: new Date() },
    });

    await prisma.rawData.createMany({
      data: scrapedData.map((d) => ({
        companyId: companyRecord.id,
        source: d.source,
        data: d as object,
      })),
    });

    await prisma.report.create({
      data: {
        companyId: companyRecord.id,
        overallScore: report.overallScore ?? 0,
        salaryMin: report.salary?.roles?.[0]?.min ?? null,
        salaryMax: report.salary?.roles?.[0]?.max ?? null,
        interviewDifficulty: report.interview?.difficulty ?? null,
        cultureKeywords: report.culture?.positiveKeywords ?? [],
        redFlags: report.redFlags?.map((f) => f.issue) ?? [],
        aiSummary: `[${lang}] ${report.summary ?? ""}`,
        fullReport: report as object,
        expiresAt: new Date(Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[admin] ${company} done! Score: ${report.overallScore}`);
    return NextResponse.json({
      success: true,
      company,
      score: report.overallScore,
      summary: report.summary,
    });
  } catch (error) {
    console.error(`[admin] ${company} failed:`, error);
    // Force cleanup browser on failure to prevent zombie processes
    await closeBrowser();
    return NextResponse.json(
      { error: String(error), company },
      { status: 500 }
    );
  }
}
