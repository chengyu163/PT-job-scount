import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

export async function scrapeGlassdoor(
  companyName: string
): Promise<ScrapedData> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    const searchUrl = `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(companyName)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);

    const companyLink = await page
      .$eval('a[href*="/Overview/"]', (el) => el.getAttribute("href"))
      .catch(() => null);

    if (!companyLink) {
      await page.close();
      return { source: "glassdoor", sector: "all" };
    }

    const fullUrl = companyLink.startsWith("http")
      ? companyLink
      : `https://www.glassdoor.com${companyLink}`;
    await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || "";
      const getNum = (sel: string) => parseFloat(getText(sel)) || 0;

      const reviews: any[] = [];
      document.querySelectorAll("[class*=review]").forEach((el) => {
        const text = el.textContent?.trim().replace(/\s+/g, " ") || "";
        if (text.length > 100 && text.length < 2000) {
          reviews.push({ text: text.substring(0, 500), rating: 0, date: "", pros: "", cons: "" });
        }
      });

      return {
        overallRating: getNum('[data-test="rating-info"] .average') || getNum(".ratingNum") || getNum('[class*="rating"]'),
        cultureRating: getNum('[data-test="rating-culture"]'),
        compRating: getNum('[data-test="rating-compensation"]'),
        size: getText('[data-test="employer-size"]'),
        industry: getText('[data-test="employer-industry"]'),
        founded: getText('[data-test="employer-founded"]'),
        reviews: reviews.slice(0, 10),
      };
    });

    await page.close();

    return {
      source: "glassdoor",
      sector: "all",
      ratings: {
        overall: data.overallRating,
        culture: data.cultureRating,
        salary: data.compRating,
      },
      reviews: data.reviews,
      companyInfo: {
        size: data.size,
        founded: data.founded,
        industry: data.industry,
      },
    };
  } catch (error) {
    console.error("Glassdoor scrape failed:", error);
    return { source: "glassdoor", sector: "all" };
  }
}
