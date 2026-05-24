import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

const BASE_URL = "https://www.itjobs.pt";

export async function scrapeItjobs(
  companyName: string
): Promise<ScrapedData> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(
      `${BASE_URL}/pesquisa?q=${encodeURIComponent(companyName)}`,
      { waitUntil: "domcontentloaded", timeout: 15000 }
    );
    await page.waitForTimeout(2000);

    const jobs = await page.evaluate((baseUrl) => {
      const results: any[] = [];
      document.querySelectorAll(".list-group-item, .job-item, [class*=offer]").forEach((el) => {
        const title = (el.querySelector("h2, h3, [class*=title]")?.textContent?.trim()) || "";
        const techStack: string[] = [];
        el.querySelectorAll(".badge, .tag, [class*=tech]").forEach((tag) => {
          const t = tag.textContent?.trim();
          if (t && t.length < 30) techStack.push(t);
        });
        const location = el.querySelector("[class*=location]")?.textContent?.trim() || "";
        const link = el.querySelector("a")?.getAttribute("href") || "";
        if (title) {
          results.push({
            title,
            department: "IT",
            techStack,
            remote: location.toLowerCase().includes("remoto") || location.toLowerCase().includes("remote"),
            url: link.startsWith("http") ? link : `${baseUrl}${link}`,
          });
        }
      });
      return results.slice(0, 10);
    }, BASE_URL);

    await page.close();

    return {
      source: "itjobs",
      sector: "it",
      jobs,
    };
  } catch (error) {
    console.error("itjobs scrape failed:", error);
    return { source: "itjobs", sector: "it" };
  }
}
