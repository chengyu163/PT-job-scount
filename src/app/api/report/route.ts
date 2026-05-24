import { NextRequest, NextResponse } from "next/server";
import { aggregateData } from "@/lib/scrapers";
import { analyzeCompany } from "@/lib/ai/analyze";
import { getCachedReport, setCachedReport } from "@/lib/cache";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const companyName = request.nextUrl.searchParams.get("company");
  if (!companyName) {
    return NextResponse.json({ error: "Missing company name" }, { status: 400 });
  }

  const slug = slugify(companyName);

  const cached = await getCachedReport(slug);
  if (cached) {
    return NextResponse.json({ report: cached, cached: true });
  }

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

  const report = await analyzeCompany(companyName, scrapedData);
  await setCachedReport(slug, report);

  return NextResponse.json({ report, cached: false });
}
