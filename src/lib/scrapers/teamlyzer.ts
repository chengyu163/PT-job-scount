import * as cheerio from "cheerio";
import { getBrowser } from "./browser";
import { ScrapedData } from "../types";

const BASE_URL = "https://pt.teamlyzer.com";

async function fetchPage(url: string): Promise<string> {
  const browser = await getBrowser();
  const context = await browser.newContext();

  if (process.env.TEAMLYZER_SESSION || process.env.TEAMLYZER_REMEMBER) {
    const cookies = [];
    if (process.env.TEAMLYZER_SESSION) {
      cookies.push({
        name: "session",
        value: process.env.TEAMLYZER_SESSION,
        domain: ".teamlyzer.com",
        path: "/",
      });
    }
    if (process.env.TEAMLYZER_REMEMBER) {
      cookies.push({
        name: "remember_token",
        value: process.env.TEAMLYZER_REMEMBER,
        domain: ".teamlyzer.com",
        path: "/",
      });
    }
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);
  const html = await page.content();
  await page.close();
  await context.close();
  return html;
}

async function fetchAllPages(baseUrl: string, maxPages = 10): Promise<string[]> {
  const firstHtml = await fetchPage(baseUrl);
  const $ = cheerio.load(firstHtml);

  const pageLinks: number[] = [];
  $("a[href*=page]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/page=(\d+)/);
    if (match) pageLinks.push(parseInt(match[1]));
  });
  const totalPages = Math.min(Math.max(...pageLinks, 1), maxPages);

  if (totalPages <= 1) return [firstHtml];

  const sep = baseUrl.includes("?") ? "&" : "?";
  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchPage(`${baseUrl}${sep}page=${i + 2}`)
    )
  );

  return [firstHtml, ...remaining];
}

function extractReviewLinks(pages: string[]): string[] {
  const links: string[] = [];
  for (const html of pages) {
    const $ = cheerio.load(html);
    $("a[href*=work-reviews/], a[href*=interview-reviews/]").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.match(/\/\d+\//)) {
        const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (!links.includes(fullUrl)) links.push(fullUrl);
      }
    });
  }
  return links;
}

function extractDetailedReview(html: string): {
  text: string;
  role: string;
  tech: string[];
  ratings: Record<string, number>;
  companyReply: string;
} | null {
  const $ = cheerio.load(html);

  const titleEl = $("h3, .col-lg-9.center_mobile").first();
  const titleText = titleEl.text().trim().replace(/\s+/g, " ");
  if (!titleText || titleText.length < 5) return null;

  // Extract role and level
  const roleMatch = titleText.match(/por\s+um\s+(.+?)(?:\s+na\s+|$)/i);
  const role = roleMatch ? roleMatch[1].trim() : "";

  // Extract tech tags
  const tech: string[] = [];
  $(".col-lg-9 a[href*=tag], .col-lg-9 .badge").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length > 1 && t.length < 30) tech.push(t);
  });

  // Extract per-review ratings
  const ratings: Record<string, number> = {};
  $("[role=progressbar]").each((_, el) => {
    const container = $(el).parent().parent();
    const label = container.text().trim().replace(/\s+/g, " ");
    const match = label.match(/(\d+)\/100/);
    if (match) {
      const score = parseInt(match[1]);
      const lc = label.toLowerCase();
      if (lc.includes("trabalho/vida")) ratings.workLifeBalance = score;
      else if (lc.includes("salário")) ratings.salary = score;
      else if (lc.includes("gestão")) ratings.management = score;
      else if (lc.includes("carreira")) ratings.career = score;
      else if (lc.includes("reconhecimento")) ratings.recognition = score;
    }
  });

  // Extract company reply
  const replyEl = $(".review-official-reply, .voffset2.ellipsis");
  const companyReply = replyEl.text().trim().replace(/\s+/g, " ").substring(0, 500);

  // Clean title
  const cleanTitle = titleText
    .replace(/INSIDER|Review secreta/g, "")
    .replace(/há\s+\d+\s+\w+/g, "")
    .replace(/por\s+um\s+.*/g, "")
    .replace(/\d+\s*Votos?/g, "")
    .replace(/[""“”]/g, "")
    .trim();

  return { text: cleanTitle, role, tech, ratings, companyReply };
}

export async function scrapeTeamlyzer(
  companyName: string
): Promise<ScrapedData> {
  const slug = companyName.toLowerCase().replace(/\s+/g, "-");

  try {
    // Fetch main page
    const mainHtml = await fetchPage(`${BASE_URL}/companies/${slug}`);

    // Fetch review list pages
    const [workPages, interviewPages, salaryPages] = await Promise.all([
      fetchAllPages(`${BASE_URL}/companies/${slug}/work-reviews`),
      fetchAllPages(`${BASE_URL}/companies/${slug}/interview-reviews`),
      fetchAllPages(`${BASE_URL}/companies/${slug}/salary-reviews`),
    ]);

    // Get individual review links and fetch details (limit to 10 for speed)
    const workLinks = extractReviewLinks(workPages).slice(0, 10);
    const detailedReviews = await Promise.all(
      workLinks.map(async (url) => {
        const html = await fetchPage(url);
        return extractDetailedReview(html);
      })
    );

    const $ = cheerio.load(mainHtml);

    // Extract overall ratings from main page
    const ratings: Record<string, number> = {};
    $("[role=progressbar]").each((_, el) => {
      const container = $(el).parent().parent();
      const label = container.text().trim().replace(/\s+/g, " ");
      const match = label.match(/(\d+)\/100/);
      if (match) {
        const score = parseInt(match[1]);
        const lc = label.toLowerCase();
        if (lc.includes("trabalho/vida")) ratings.workLifeBalance = score;
        else if (lc.includes("salário")) ratings.salary = score;
        else if (lc.includes("gestão")) ratings.management = score;
        else if (lc.includes("carreira")) ratings.career = score;
        else if (lc.includes("reconhecimento")) ratings.recognition = score;
        else if (lc.includes("entrevista")) ratings.interviewDifficulty = score;
      }
    });

    // Collect all tech tags from detailed reviews + main page
    const allTech: string[] = [];
    $(".badge, a[href*=tag]").each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 1 && t.length < 30 && !t.includes("INSIDER") && !t.includes("Seguir")) {
        allTech.push(t);
      }
    });
    for (const r of detailedReviews) {
      if (r?.tech) allTech.push(...r.tech);
    }

    // Build reviews from detailed + list fallback
    const reviews: { text: string; rating: number; date: string; pros: string; cons: string }[] = [];
    for (const r of detailedReviews) {
      if (!r) continue;
      const ratingVals = Object.values(r.ratings);
      const avg = ratingVals.length > 0
        ? ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length / 10
        : 0;
      reviews.push({
        text: `${r.text}${r.role ? ` (${r.role})` : ""}${r.companyReply ? ` | Company reply: ${r.companyReply}` : ""}`,
        rating: Math.round(avg * 10) / 10,
        date: "",
        pros: Object.entries(r.ratings)
          .filter(([, v]) => v >= 75)
          .map(([k]) => k)
          .join(", "),
        cons: Object.entries(r.ratings)
          .filter(([, v]) => v <= 40)
          .map(([k]) => k)
          .join(", "),
      });
    }

    // Add remaining reviews from list pages (titles only)
    for (const html of workPages) {
      const $w = cheerio.load(html);
      $w("h3").each((_, el) => {
        const title = $w(el).text().trim().replace(/\s+/g, " ");
        if (
          title.length > 5 &&
          !title.includes("Volume de reviews") &&
          !title.includes("Política") &&
          !title.includes("Descrição") &&
          !reviews.some((r) => r.text.includes(title.substring(0, 20)))
        ) {
          reviews.push({
            text: title.replace(/INSIDER|Review secreta/g, "").trim(),
            rating: 0,
            date: "",
            pros: "",
            cons: "",
          });
        }
      });
    }

    // Extract interview titles from all pages
    const interviews: { difficulty: number; questions: string[]; process: string }[] = [];
    for (const html of interviewPages) {
      const $i = cheerio.load(html);
      $i("h3").each((_, el) => {
        const title = $i(el).text().trim().replace(/\s+/g, " ");
        if (title.length > 5 && !title.includes("Volume") && !title.includes("Descrição")) {
          interviews.push({
            difficulty: ratings.interviewDifficulty ? ratings.interviewDifficulty / 10 : 0,
            questions: [],
            process: title.replace(/INSIDER|Review secreta/g, "").trim(),
          });
        }
      });
    }

    // Company info
    const companyText = $.text();
    const sizeMatch = companyText.match(/([\d,.]+-[\d,.]+|[\d,.]+)\s*(colaboradores|employees)/i)
      || companyText.match(/(\d[\d,.]+\s*-\s*\d[\d,.]+)/);

    const ratingValues = Object.values(ratings);
    const overall =
      ratingValues.length > 0
        ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length / 10
        : 0;

    return {
      source: "teamlyzer",
      sector: "it",
      ratings: {
        overall: Math.round(overall * 10) / 10,
        culture: (ratings.workLifeBalance || 0) / 10,
        salary: (ratings.salary || 0) / 10,
      },
      reviews,
      interviews,
      jobs:
        [...new Set(allTech)].length > 0
          ? [{ title: "", department: "IT", techStack: [...new Set(allTech)].slice(0, 25), remote: false, url: "" }]
          : [],
      companyInfo: {
        size: sizeMatch ? sizeMatch[1] : "",
        founded: "",
        industry: "IT",
      },
    };
  } catch (error) {
    console.error("Teamlyzer scrape failed:", error);
    return { source: "teamlyzer", sector: "it" };
  }
}
