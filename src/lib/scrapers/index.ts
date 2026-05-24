import { ScrapedData } from "../types";
import { scrapeTeamlyzer } from "./teamlyzer";
import { scrapeGlassdoor } from "./glassdoor";
import { scrapeLinkedIn } from "./linkedin";
import { scrapeItjobs } from "./itjobs";
import { scrapeIndeed } from "./indeed";
import { scrapeLanding } from "./landing";
import { closeBrowser } from "./browser";

async function runWithRetry(
  name: string,
  fn: () => Promise<ScrapedData>,
  fallbackSource: string,
  retries = 1,
): Promise<ScrapedData> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) console.log(`[scraper] Retrying ${name} (attempt ${attempt + 1})...`);
      else console.log(`[scraper] Starting ${name}...`);
      const result = await fn();
      const hasContent =
        (result.ratings && result.ratings.overall > 0) ||
        (result.reviews && result.reviews.length > 0) ||
        (result.salaries && result.salaries.length > 0) ||
        (result.jobs && result.jobs.length > 0);
      console.log(`[scraper] ${name} done (data: ${hasContent ? "yes" : "empty"})`);
      return result;
    } catch (e) {
      console.error(`[scraper] ${name} failed (attempt ${attempt + 1}):`, e);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));
      }
    }
  }
  return { source: fallbackSource };
}

export async function aggregateData(
  companyName: string
): Promise<ScrapedData[]> {
  const data: ScrapedData[] = [];

  // Run heavy scrapers sequentially with retry
  data.push(await runWithRetry("teamlyzer", () => scrapeTeamlyzer(companyName), "teamlyzer"));
  data.push(await runWithRetry("indeed", () => scrapeIndeed(companyName), "indeed (Portugal)"));

  // Run lighter scrapers in parallel with retry
  const lightResults = await Promise.all([
    runWithRetry("glassdoor", () => scrapeGlassdoor(companyName), "glassdoor"),
    runWithRetry("linkedin", () => scrapeLinkedIn(companyName), "linkedin"),
    runWithRetry("itjobs", () => scrapeItjobs(companyName), "itjobs"),
    runWithRetry("landing.jobs", () => scrapeLanding(companyName), "landing.jobs"),
  ]);
  data.push(...lightResults);

  await closeBrowser();
  return data;
}
