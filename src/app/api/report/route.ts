import { NextRequest, NextResponse } from "next/server";
import { aggregateData } from "@/lib/scrapers";
import { analyzeCompany } from "@/lib/ai/analyze";
import { prisma } from "@/lib/db";
import { Locale } from "@/lib/i18n";

const CACHE_DAYS = 7;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const companyName = request.nextUrl.searchParams.get("company");
  const lang = (request.nextUrl.searchParams.get("lang") || "en") as Locale;

  if (!companyName) {
    return NextResponse.json({ error: "Missing company name" }, { status: 400 });
  }

  const slug = slugify(companyName);
  const force = request.nextUrl.searchParams.get("force") === "true";

  // Check database for recent report in this language
  if (!force) {
    const existing = await prisma.report.findFirst({
      where: {
        company: { slug },
        expiresAt: { gt: new Date() },
        aiSummary: { startsWith: `[${lang}]` },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({ report: existing.fullReport, cached: true });
    }
  }

  // Scrape fresh data
  const scrapedData = await aggregateData(companyName);

  const hasData = scrapedData.some(
    (d) =>
      (d.ratings && d.ratings.overall > 0) ||
      (d.reviews && d.reviews.length > 0) ||
      (d.jobs && d.jobs.length > 0) ||
      d.companyInfo
  );

  if (!hasData) {
    return NextResponse.json(
      { error: "No data found for this company" },
      { status: 404 }
    );
  }

  // AI analysis in requested language
  const report = await analyzeCompany(companyName, scrapedData, lang);

  // Store in database
  const company = await prisma.company.upsert({
    where: { slug },
    create: { name: companyName, slug },
    update: { name: companyName, updatedAt: new Date() },
  });

  await prisma.rawData.createMany({
    data: scrapedData.map((d) => ({
      companyId: company.id,
      source: d.source,
      data: d as object,
    })),
  });

  await prisma.report.create({
    data: {
      companyId: company.id,
      overallScore: report.overallScore ?? 0,
      salaryMin: report.salary?.it?.mid?.min ?? null,
      salaryMax: report.salary?.it?.senior?.max ?? null,
      interviewDifficulty: report.interview?.difficulty ?? null,
      cultureKeywords: report.culture?.positiveKeywords ?? [],
      redFlags: report.redFlags?.map((f) => f.issue) ?? [],
      aiSummary: `[${lang}] ${report.summary ?? ""}`,
      fullReport: report as object,
      expiresAt: new Date(Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ report, cached: false });
}
