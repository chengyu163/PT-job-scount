import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ScoredJob } from "@/lib/types";

const PT_MEDIAN_SALARY = 35000;

function scoreSalary(min: number | null, max: number | null): number {
  if (!min && !max) return 5;
  const avg = ((min || 0) + (max || 0)) / 2;
  if (avg <= 0) return 5;
  const ratio = avg / PT_MEDIAN_SALARY;
  return Math.min(Math.round(ratio * 5 * 10) / 10, 10);
}

function scoreRemote(remote: boolean): number {
  return remote ? 10 : 4;
}

function scoreTech(techStack: string[]): number {
  if (techStack.length === 0) return 5;
  const hotTech = ["React", "TypeScript", "Python", "AWS", "Kubernetes", "Go", "Rust", "Next.js", "Node.js", "Docker", "Kafka", "GraphQL", "Terraform"];
  const matches = techStack.filter((t) =>
    hotTech.some((h) => t.toLowerCase().includes(h.toLowerCase()))
  ).length;
  return Math.min(5 + matches * 1.5, 10);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";

  // Get all raw job data from database
  const rawData = await prisma.rawData.findMany({
    include: { company: true },
    orderBy: { scrapedAt: "desc" },
  });

  // Get company reports for ratings
  const reports = await prisma.report.findMany({
    include: { company: true },
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  const companyRatings = new Map<string, number>();
  const companyHasReport = new Set<string>();
  for (const r of reports) {
    if (!companyRatings.has(r.company.slug)) {
      companyRatings.set(r.company.slug, r.overallScore);
      companyHasReport.add(r.company.slug);
    }
  }

  // Aggregate all jobs
  const allJobs: ScoredJob[] = [];
  const seen = new Set<string>();

  for (const raw of rawData) {
    const data = raw.data as Record<string, unknown>;
    const jobs = data.jobs as { title: string; department?: string; techStack?: string[]; remote?: boolean; url?: string }[] | undefined;
    const salaries = data.salaries as { role: string; min: number; max: number; currency?: string }[] | undefined;

    if (!jobs) continue;

    const salaryMap = new Map<string, { min: number; max: number }>();
    if (salaries) {
      for (const s of salaries) {
        salaryMap.set(s.role.toLowerCase(), { min: s.min, max: s.max });
      }
    }

    for (const job of jobs) {
      if (!job.title || job.title.length < 3) continue;

      // Filter out non-job entries (people names, brand names, etc.)
      const titleLower = job.title.toLowerCase();
      const jobIndicators = [
        "engineer", "developer", "manager", "analyst", "designer", "architect",
        "lead", "director", "specialist", "consultant", "coordinator", "intern",
        "scientist", "administrator", "devops", "qa", "tester", "support",
        "marketing", "sales", "finance", "hr", "recruiter", "product", "data",
        "security", "cloud", "mobile", "frontend", "backend", "fullstack",
        "full-stack", "full stack", "software", "senior", "junior", "head of",
        "vp ", "chief", "officer", "programador", "engenheiro", "analista",
        "gestor", "técnico", "assistente", "estagiário",
      ];
      const looksLikeJob = jobIndicators.some((kw) => titleLower.includes(kw));
      if (!looksLikeJob && !job.url) continue;

      const key = `${titleLower}-${raw.company.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Try to match salary
      let salaryMin: number | null = null;
      let salaryMax: number | null = null;
      for (const [role, range] of salaryMap) {
        if (titleLower.includes(role) || role.includes(titleLower.split(" ")[0])) {
          salaryMin = range.min;
          salaryMax = range.max;
          break;
        }
      }

      const techStack = job.techStack || [];
      const remote = job.remote || false;
      const companyScore = companyRatings.get(raw.company.slug) ?? 5;

      const breakdown = {
        salaryScore: scoreSalary(salaryMin, salaryMax),
        companyScore,
        remoteScore: scoreRemote(remote),
        techScore: scoreTech(techStack),
      };

      const score = Math.round(
        (breakdown.salaryScore * 0.35 +
          breakdown.companyScore * 0.30 +
          breakdown.remoteScore * 0.15 +
          breakdown.techScore * 0.20) * 10
      ) / 10;

      const scored: ScoredJob = {
        title: job.title,
        company: raw.company.name,
        source: raw.source,
        location: "Portugal",
        remote,
        techStack,
        salaryMin,
        salaryMax,
        currency: "EUR",
        url: job.url || "",
        score,
        scoreBreakdown: breakdown,
        companyRating: companyRatings.get(raw.company.slug) ?? null,
        hasReport: companyHasReport.has(raw.company.slug),
      };

      allJobs.push(scored);
    }
  }

  // Filter by query
  let filtered = allJobs;
  if (q) {
    filtered = allJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.techStack.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort by score descending
  filtered.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    jobs: filtered,
    total: filtered.length,
    sources: [...new Set(allJobs.map((j) => j.source))],
  });
}
