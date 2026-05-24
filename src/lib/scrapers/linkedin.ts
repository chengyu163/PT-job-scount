import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

export async function scrapeLinkedIn(
  companyName: string
): Promise<ScrapedData> {
  const slug = companyName.toLowerCase().replace(/\s+/g, "-");

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`https://www.linkedin.com/company/${slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const description =
        document.querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";

      const allText = document.body.textContent || "";
      const sizeMatch = allText.match(/(\d[\d,]+)\s*(?:employees|funcionários|seguidores)/i);
      const industryEl = document.querySelector('[class*="industry"]');

      const jobs: any[] = [];
      document.querySelectorAll(".base-card--link, [class*=job-card]").forEach((el) => {
        const title = el.querySelector("[class*=title]")?.textContent?.trim() || "";
        const location = el.querySelector("[class*=location]")?.textContent?.trim() || "";
        const url = el.querySelector("a")?.getAttribute("href") || "";
        if (title) {
          jobs.push({
            title,
            department: "",
            remote: location.toLowerCase().includes("remote"),
            url,
          });
        }
      });

      return {
        description,
        size: sizeMatch ? sizeMatch[1] : "",
        industry: industryEl?.textContent?.trim() || "",
        jobs: jobs.slice(0, 10),
      };
    });

    await page.close();

    return {
      source: "linkedin",
      sector: "all",
      companyInfo: {
        size: data.size,
        founded: "",
        industry: data.industry,
      },
      jobs: data.jobs,
    };
  } catch (error) {
    console.error("LinkedIn scrape failed:", error);
    return { source: "linkedin", sector: "all" };
  }
}
