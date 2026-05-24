import * as cheerio from "cheerio";
import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

async function fetchIndeedPage(url: string, context: Awaited<ReturnType<Awaited<ReturnType<typeof getBrowser>>["newContext"]>>): Promise<string> {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);

  const acceptBtn = await page.$("button#onetrust-accept-btn-handler");
  if (acceptBtn) {
    await acceptBtn.click();
    await page.waitForTimeout(2000);
  }

  const html = await page.content();
  await page.close();
  return html;
}

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

    // Fetch main page and salary page with separate contexts to avoid blocks
    const mainHtml = await fetchIndeedPage(`https://pt.indeed.com/cmp/${slug}`, context);
    await context.close();

    const context2 = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      locale: "pt-PT",
      timezoneId: "Europe/Lisbon",
    });
    const salaryHtml = await fetchIndeedPage(`https://pt.indeed.com/cmp/${slug}/salaries`, context2);
    await context2.close();

    // --- Parse main company page (ratings + review snippets) ---
    const $main = cheerio.load(mainHtml);
    const mainText = $main("body").text().replace(/\s+/g, " ");

    // Overall rating (e.g. "3,9 em 5 estrelas")
    const ratingMatch = mainText.match(/(\d[.,]\d)\s*em\s*5\s*estrelas/);
    const overall = ratingMatch
      ? parseFloat(ratingMatch[1].replace(",", ".")) * 2
      : 0;

    // Review count
    const countMatch = mainText.match(/([\d.,]+)\s*Avaliações/);
    const reviewCount = countMatch ? parseInt(countMatch[1].replace(/\./g, "")) : 0;

    // CEO approval
    const ceoMatch = mainText.match(/(\d+)%\s*Taxa de aprovação/);
    const ceoApproval = ceoMatch ? parseInt(ceoMatch[1]) : 0;

    // Extract review snippets from main page
    const reviews: { text: string; rating: number; date: string; pros: string; cons: string }[] = [];
    $main('[data-testid="reviews-section"]').find('[data-testid*="review"]').each((_, el) => {
      const text = $main(el).text().trim().replace(/\s+/g, " ");
      if (text.length > 30) {
        const starMatch = text.match(/(\d[.,]\d)\s*em/);
        const rating = starMatch ? parseFloat(starMatch[1].replace(",", ".")) * 2 : 0;
        reviews.push({
          text: text.substring(0, 500),
          rating,
          date: "",
          pros: "",
          cons: "",
        });
      }
    });

    // Also grab any review-like text blocks
    if (reviews.length === 0) {
      const reviewSection = $main('[data-testid="reviews-section"]').text().trim().replace(/\s+/g, " ");
      if (reviewSection.length > 50) {
        reviews.push({
          text: reviewSection.substring(0, 800),
          rating: overall,
          date: "",
          pros: "",
          cons: "",
        });
      }
    }

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

    // Extract job listings
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

    return {
      source: "indeed",
      sector: "all",
      ratings: overall > 0
        ? { overall, culture: 0, salary: 0 }
        : undefined,
      reviews,
      salaries,
      jobs: jobs.slice(0, 10),
      companyInfo: {
        size: "",
        founded: "",
        industry: "",
        ...(ceoApproval > 0 ? { capital: `CEO approval: ${ceoApproval}%` } : {}),
      },
    };
  } catch (error) {
    console.error("Indeed scrape failed:", error);
    return { source: "indeed", sector: "all" };
  }
}
