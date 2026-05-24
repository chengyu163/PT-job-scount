import * as cheerio from "cheerio";
import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

export async function scrapeLanding(
  companyName: string
): Promise<ScrapedData> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const slug = companyName.toLowerCase().replace(/\s+/g, "-");

    // Try company page directly first
    await page.goto(`https://landing.jobs/at/${slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Accept cookies if present
    const acceptBtn = await page.$('button:has-text("Accept All")');
    if (acceptBtn) {
      await acceptBtn.click();
      await page.waitForTimeout(1000);
    }

    let html = await page.content();
    let $ = cheerio.load(html);
    const title = $("title").text();

    // If company page doesn't exist or has no jobs, search in job listings
    const hasJobs = $("a[href*='/at/" + slug + "/']").length > 0;
    if (title.includes("404") || title.includes("Not Found") || html.length < 5000 || !hasJobs) {
      await page.goto(
        `https://landing.jobs/jobs?hd=false&t_co=false&t_st=false&q=${encodeURIComponent(companyName)}`,
        { waitUntil: "domcontentloaded", timeout: 15000 }
      );
      await page.waitForTimeout(3000);
      // Accept cookies again if needed
      const btn2 = await page.$('button:has-text("Accept All")');
      if (btn2) { await btn2.click(); await page.waitForTimeout(1000); }
      html = await page.content();
      $ = cheerio.load(html);
    }

    await page.close();

    const bodyText = $("body").text().replace(/\s+/g, " ");

    // Extract job listings with salary, tech stack, location
    const jobs: { title: string; department: string; techStack: string[]; remote: boolean; url: string }[] = [];
    const salaries: { role: string; department: string; min: number; max: number; currency: string }[] = [];

    // Find all job links with their context
    $("a[href*='/at/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (!href.includes("/at/") || href.split("/").length < 4) return;

      const parent = $(el).closest("[class]").parent();
      const context = parent.text().replace(/\s+/g, " ").trim();

      // Extract job title from URL or text
      const urlParts = href.split("/");
      const jobSlug = urlParts[urlParts.length - 1] || "";
      const jobTitle = jobSlug
        .replace(/-in-.*$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      if (jobTitle.length < 5 || jobTitle === "View Job") return;

      // Check if this job is from the target company
      const companyLower = companyName.toLowerCase();
      const contextLower = context.toLowerCase();
      if (!contextLower.includes(companyLower) && !href.includes(slug)) return;

      // Extract tech stack from context
      const techStack: string[] = [];
      const techPatterns = context.match(/(?:Python|Java(?:Script)?|React|TypeScript|Node\.js|AWS|Azure|Docker|Kubernetes|Go|C#|\.NET|SQL|PostgreSQL|MongoDB|Redis|Kafka|Next\.js|Vue|Angular|PHP|Ruby|Scala|Terraform|CI\/CD|GraphQL|REST|Microservices)/gi);
      if (techPatterns) techStack.push(...[...new Set(techPatterns)]);

      // Extract salary
      const salaryMatch = context.match(/€([\d.,]+)\s*[-–]\s*€?([\d.,]+)/);
      if (salaryMatch) {
        const min = parseInt(salaryMatch[1].replace(/\./g, ""));
        const max = parseInt(salaryMatch[2].replace(/\./g, ""));
        if (min > 0 && max > 0) {
          salaries.push({ role: jobTitle, department: "IT", min, max, currency: "EUR" });
        }
      }

      // Detect remote
      const remote = contextLower.includes("remote");
      const location = context.match(/(?:Lisbon|Lisboa|Porto|Portugal|Remote)/i)?.[0] || "";

      if (!jobs.some((j) => j.title === jobTitle)) {
        jobs.push({
          title: jobTitle,
          department: "IT",
          techStack: techStack.slice(0, 8),
          remote,
          url: href.startsWith("http") ? href : `https://landing.jobs${href}`,
        });
      }
    });

    // If no company-specific jobs found, try to extract general market data
    if (jobs.length === 0) {
      // Get salary ranges from all visible jobs for market comparison
      const allSalaries = bodyText.match(/€([\d.,]+)\s*[-–]\s*€?([\d.,]+)/g);
      if (allSalaries && allSalaries.length > 3) {
        const values = allSalaries
          .map((s) => {
            const m = s.match(/€([\d.,]+)\s*[-–]\s*€?([\d.,]+)/);
            if (!m) return null;
            return {
              min: parseInt(m[1].replace(/\./g, "")),
              max: parseInt(m[2].replace(/\./g, "")),
            };
          })
          .filter((v) => v && v.min > 10000 && v.max < 200000) as { min: number; max: number }[];

        if (values.length > 0) {
          const avgMin = Math.round(values.reduce((a, b) => a + b.min, 0) / values.length);
          const avgMax = Math.round(values.reduce((a, b) => a + b.max, 0) / values.length);
          salaries.push({
            role: "Market average (Landing.jobs Portugal)",
            department: "IT",
            min: avgMin,
            max: avgMax,
            currency: "EUR",
          });
        }
      }
    }

    return {
      source: "landing.jobs",
      sector: "it",
      jobs: jobs.slice(0, 15),
      salaries,
    };
  } catch (error) {
    console.error("Landing.jobs scrape failed:", error);
    return { source: "landing.jobs", sector: "it" };
  }
}
