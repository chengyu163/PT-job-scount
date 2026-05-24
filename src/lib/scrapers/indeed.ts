import * as cheerio from "cheerio";
import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

export async function scrapeIndeed(
  companyName: string
): Promise<ScrapedData> {
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      locale: "pt-PT",
      timezoneId: "Europe/Lisbon",
    });

    const slug = companyName.toLowerCase().replace(/\s+/g, "-");

    // Use a single page, navigate sequentially
    const page = await context.newPage();

    // 1. Salary page first (most reliable)
    await page.goto(`https://pt.indeed.com/cmp/${slug}/salaries`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(3000);
    const acceptBtn = await page.$("button#onetrust-accept-btn-handler");
    if (acceptBtn) {
      await acceptBtn.click();
      await page.waitForTimeout(1500);
    }
    const salaryHtml = await page.content();

    // 2. Navigate to PT-filtered reviews
    await page.goto(`https://pt.indeed.com/cmp/${slug}/reviews?fcountry=PT`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(3000);
    const reviewHtml = await page.content();

    await page.close();
    await context.close();

    // --- Parse salary page ---
    const $sal = cheerio.load(salaryHtml);
    const salaries: { role: string; department: string; min: number; max: number; currency: string }[] = [];

    $sal('[data-testid="salary-v2-category-group-card"], [data-testid*="salary-entry"]').each((_, el) => {
      const text = $sal(el).text().trim().replace(/\s+/g, " ");
      const titleEl = $sal(el).find('[data-testid*="card-title"], [data-testid*="compareLink"]');
      const role = titleEl.text().trim() || text.split(/\d/)[0].trim();

      const salaryMatch = text.match(/([\d\s.,]+)\s*€\s*por\s*ano/);
      if (salaryMatch && role) {
        const annual = parseInt(salaryMatch[1].replace(/[\s.]/g, ""));
        if (annual > 0) {
          salaries.push({
            role,
            department: "",
            min: Math.round(annual * 0.85),
            max: Math.round(annual * 1.15),
            currency: "EUR",
          });
        }
      }
    });

    // Extract jobs from salary page
    const jobs: { title: string; department: string; remote: boolean; url: string }[] = [];
    $sal('[data-testid*="salary-popular-job-card"]').each((_, el) => {
      const text = $sal(el).text().trim();
      const parts = text.split(/Lisboa|Porto|Portugal|Candidat|há\s/);
      const title = parts[0]?.trim();
      if (title && title.length > 3 && !jobs.some((j) => j.title === title)) {
        jobs.push({
          title,
          department: "",
          remote: text.toLowerCase().includes("remoto") || text.toLowerCase().includes("remote"),
          url: "",
        });
      }
    });

    // --- Parse PT-filtered reviews ---
    const $rev = cheerio.load(reviewHtml);
    const revText = $rev("body").text().replace(/\s+/g, " ");

    // Extract PT-specific ratings
    const overallMatch = revText.match(/Avaliação geral([\d,]+)/);
    const wlbMatch = revText.match(/([\d,]+)\s*em 5 estrelas para Equilíbrio/);
    const salRatingMatch = revText.match(/([\d,]+)\s*em 5 estrelas para Salário/);
    const careerMatch = revText.match(/([\d,]+)\s*em 5 estrelas para Estabilidade/);
    const mgmtMatch = revText.match(/([\d,]+)\s*em 5 estrelas para Direção/);
    const cultureMatch = revText.match(/([\d,]+)\s*em 5 estrelas para Cultura/);

    const overall = overallMatch ? parseFloat(overallMatch[1].replace(",", ".")) * 2 : 0;
    const wlb = wlbMatch ? parseFloat(wlbMatch[1].replace(",", ".")) * 2 : 0;
    const culture = cultureMatch ? parseFloat(cultureMatch[1].replace(",", ".")) * 2 : 0;
    const salary = salRatingMatch ? parseFloat(salRatingMatch[1].replace(",", ".")) * 2 : 0;

    // Extract PT-only reviews
    const reviews: { text: string; rating: number; date: string; pros: string; cons: string }[] = [];
    $rev('[data-testid="review-text"]').each((_, el) => {
      const text = $rev(el).text().trim().replace(/\s+/g, " ");
      if (text.length > 10 && !text.includes("Empregado de Mesa")) {
        reviews.push({ text: text.substring(0, 500), rating: overall, date: "", pros: "", cons: "" });
      }
    });

    // Get review count for PT
    const ptCountMatch = revText.match(/(\d+)\s*avaliações/i);
    const ptReviewCount = ptCountMatch ? parseInt(ptCountMatch[1]) : reviews.length;

    return {
      source: "indeed (Portugal)",
      sector: "all",
      ratings: overall > 0 ? { overall, culture, salary } : undefined,
      reviews,
      salaries,
      jobs: jobs.slice(0, 10),
      companyInfo: {
        size: "",
        founded: "",
        industry: "",
      },
    };
  } catch (error) {
    console.error("Indeed scrape failed:", error);
    return { source: "indeed (Portugal)", sector: "all" };
  }
}
