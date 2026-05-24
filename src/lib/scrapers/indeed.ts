import * as cheerio from "cheerio";
import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

export async function scrapeIndeed(
  companyName: string
): Promise<ScrapedData> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Search for company reviews on Indeed Portugal
    const searchUrl = `https://pt.indeed.com/cmp/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, "-"))}/reviews`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    await page.close();

    const $ = cheerio.load(html);

    // Overall rating
    const overallText = $('[data-testid="rating-headline"], [class*="rating"]').first().text();
    const overallMatch = overallText.match(/([\d.]+)/);
    const overall = overallMatch ? parseFloat(overallMatch[1]) : 0;

    // Extract reviews
    const reviews: { text: string; rating: number; date: string; pros: string; cons: string }[] = [];
    $('[data-testid="review-card"], [class*="review"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (text.length > 50 && text.length < 2000) {
        const pros = $(el).find('[data-testid="pros"], [class*="pros"]').text().trim();
        const cons = $(el).find('[data-testid="cons"], [class*="cons"]').text().trim();
        reviews.push({
          text: text.substring(0, 500),
          rating: 0,
          date: "",
          pros,
          cons,
        });
      }
    });

    // Salary data
    const salaries: { role: string; department: string; min: number; max: number; currency: string }[] = [];
    $('[class*="salary"]').each((_, el) => {
      const text = $(el).text().trim();
      const salaryMatch = text.match(/€\s*([\d,.]+)\s*-?\s*€?\s*([\d,.]+)?/);
      if (salaryMatch) {
        salaries.push({
          role: "",
          department: "",
          min: parseInt(salaryMatch[1].replace(/[.,]/g, "")),
          max: parseInt((salaryMatch[2] || salaryMatch[1]).replace(/[.,]/g, "")),
          currency: "EUR",
        });
      }
    });

    return {
      source: "indeed",
      sector: "all",
      ratings: overall > 0
        ? { overall: overall * 2, culture: 0, salary: 0 }
        : undefined,
      reviews: reviews.slice(0, 15),
      salaries,
    };
  } catch (error) {
    console.error("Indeed scrape failed:", error);
    return { source: "indeed", sector: "all" };
  }
}
