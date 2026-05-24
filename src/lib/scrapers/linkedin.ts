import * as cheerio from "cheerio";
import { ScrapedData } from "../types";

export async function scrapeLinkedIn(
  companyName: string
): Promise<ScrapedData> {
  const searchUrl = `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, "-"))}`;

  const page = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    redirect: "follow",
  }).then((r) => r.text());

  const $ = cheerio.load(page);

  const size = $(".org-about-company-module__company-size-definition-text")
    .text()
    .trim();
  const industry = $(".org-top-card-summary__industry").text().trim();
  const founded = $(".org-about-company-module__founded").text().trim();

  const jobs = $(".base-card--link")
    .map((_, el) => ({
      title: $(el).find(".base-search-card__title").text().trim(),
      department: "",
      remote:
        $(el).find(".job-search-card__location").text().toLowerCase().includes("remote"),
      url: $(el).find("a").attr("href") || "",
    }))
    .get();

  return {
    source: "linkedin",
    sector: "all",
    companyInfo: {
      size: size || "",
      founded: founded || "",
      industry: industry || "",
    },
    jobs,
  };
}
