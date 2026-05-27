import * as cheerio from "cheerio";
import { ScrapedData } from "../types";

const PORTUGAL_GEO_ID = "100364837";

async function fetchLinkedIn(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,pt;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`LinkedIn ${res.status}`);
  return res.text();
}

function extractJobTitleFromUrl(url: string): string {
  const decoded = decodeURIComponent(url);
  const match = decoded.match(/\/jobs\/view\/(.+?)(?:-at-|-\d)/);
  if (!match) return "";
  return match[1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

export async function scrapeLinkedIn(
  companyName: string
): Promise<ScrapedData> {
  const slug = companyName.toLowerCase().replace(/\s+/g, "-");

  try {
    const [companyHtml, jobsHtml] = await Promise.all([
      fetchLinkedIn(`https://www.linkedin.com/company/${slug}`),
      fetchLinkedIn(
        `https://www.linkedin.com/jobs/search/?f_C=&keywords=${encodeURIComponent(companyName)}&location=Portugal&geoId=${PORTUGAL_GEO_ID}`
      ),
    ]);

    const $company = cheerio.load(companyHtml);
    const description =
      $company('meta[name="description"]').attr("content") || "";
    const allText = $company("body").text();
    const sizeMatch = allText.match(
      /(\d[\d,]+)\s*(?:employees|funcionários|seguidores)/i
    );

    const $jobs = cheerio.load(jobsHtml);
    const jobs: { title: string; department: string; remote: boolean; url: string }[] = [];
    const seen = new Set<string>();

    const slugVariants = [
      slug,
      slug.replace(/-/g, ""),
      companyName.toLowerCase().replace(/\s+/g, ""),
    ];

    $jobs('a[href*="/jobs/view/"]').each((_, el) => {
      const href = $jobs(el).attr("href") || "";
      const cleanUrl = href.split("?")[0];
      if (seen.has(cleanUrl)) return;
      seen.add(cleanUrl);

      const decodedHref = decodeURIComponent(href).toLowerCase();
      const isCompanyJob = slugVariants.some((v) => decodedHref.includes(`-at-${v}`));
      if (!isCompanyJob) return;

      const title = extractJobTitleFromUrl(href);
      const location = $jobs(el).closest(".base-card, [class*=card]")
        .find("[class*=location]").text().trim();

      if (title) {
        jobs.push({
          title,
          department: "",
          remote: location.toLowerCase().includes("remote"),
          url: cleanUrl,
        });
      }
    });

    return {
      source: "linkedin",
      sector: "all",
      companyInfo: {
        size: sizeMatch ? sizeMatch[1] : "",
        founded: "",
        industry: "",
      },
      jobs,
    };
  } catch (error) {
    console.error("LinkedIn scrape failed:", error);
    return { source: "linkedin", sector: "all" };
  }
}
