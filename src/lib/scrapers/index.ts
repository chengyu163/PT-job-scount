import { ScrapedData } from "../types";
import { scrapeTeamlyzer } from "./teamlyzer";
import { scrapeGlassdoor } from "./glassdoor";
import { scrapeLinkedIn } from "./linkedin";
import { scrapeItjobs } from "./itjobs";
import { scrapeIndeed } from "./indeed";
import { scrapeLanding } from "./landing";
import { closeBrowser } from "./browser";

export async function aggregateData(
  companyName: string
): Promise<ScrapedData[]> {
  const scrapers = [
    { name: "teamlyzer", fn: () => scrapeTeamlyzer(companyName) },
    { name: "glassdoor", fn: () => scrapeGlassdoor(companyName) },
    { name: "linkedin", fn: () => scrapeLinkedIn(companyName) },
    { name: "itjobs", fn: () => scrapeItjobs(companyName) },
    { name: "indeed", fn: () => scrapeIndeed(companyName) },
    { name: "landing.jobs", fn: () => scrapeLanding(companyName) },
  ];

  const results = await Promise.allSettled(scrapers.map((s) => s.fn()));
  await closeBrowser();

  const data: ScrapedData[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      data.push(result.value);
    } else {
      console.error(`Scraper ${scrapers[i].name} failed:`, result.reason);
      data.push({ source: scrapers[i].name });
    }
  });

  return data;
}
