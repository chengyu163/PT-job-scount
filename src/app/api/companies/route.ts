import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const POPULAR_COMPANIES = [
  { name: "Tripadvisor", slug: "tripadvisor", sector: "IT" },
  { name: "Farfetch", slug: "farfetch", sector: "IT" },
  { name: "OutSystems", slug: "outsystems", sector: "IT" },
  { name: "Talkdesk", slug: "talkdesk", sector: "IT" },
  { name: "Feedzai", slug: "feedzai", sector: "IT" },
  { name: "Unbabel", slug: "unbabel", sector: "IT" },
  { name: "Mercedes-Benz.io", slug: "mercedes-benz-io", sector: "IT" },
  { name: "Revolut", slug: "revolut", sector: "IT" },
  { name: "Cloudflare", slug: "cloudflare", sector: "IT" },
  { name: "Cisco", slug: "cisco", sector: "IT" },
  { name: "Microsoft", slug: "microsoft", sector: "IT" },
  { name: "Google", slug: "google", sector: "IT" },
  { name: "Amazon", slug: "amazon", sector: "IT" },
  { name: "Deloitte", slug: "deloitte", sector: "Business" },
  { name: "McKinsey", slug: "mckinsey", sector: "Business" },
  { name: "PwC", slug: "pwc", sector: "Business" },
  { name: "KPMG", slug: "kpmg", sector: "Business" },
  { name: "EY", slug: "ey", sector: "Business" },
];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";

  // Get previously searched companies from DB
  let dbCompanies: { name: string; slug: string; updatedAt: Date }[] = [];
  try {
    dbCompanies = await prisma.company.findMany({
      select: { name: true, slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  } catch {
    // DB might not be running
  }

  // Merge: DB companies first (they have reports), then popular suggestions
  const all = [
    ...dbCompanies.map((c) => ({ name: c.name, slug: c.slug, hasReport: true })),
    ...POPULAR_COMPANIES
      .filter((p) => !dbCompanies.some((d) => d.slug === p.slug))
      .map((p) => ({ name: p.name, slug: p.slug, hasReport: false })),
  ];

  // Filter by query
  const filtered = q
    ? all.filter((c) => c.name.toLowerCase().includes(q))
    : all;

  return NextResponse.json(filtered.slice(0, 10));
}
