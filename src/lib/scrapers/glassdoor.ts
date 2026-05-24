import * as cheerio from "cheerio";
import { ScrapedData } from "../types";

const BASE_URL = "https://www.glassdoor.com";

export async function scrapeGlassdoor(
  companyName: string
): Promise<ScrapedData> {
  const searchUrl = `${BASE_URL}/Search/results.htm?keyword=${encodeURIComponent(companyName)}&locT=C&locId=2394819`;
  const searchPage = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  }).then((r) => r.text());

  const $ = cheerio.load(searchPage);
  const companyLink = $('a[href*="/Overview/"]').first().attr("href");

  if (!companyLink) {
    return { source: "glassdoor", sector: "all" };
  }

  const fullUrl = companyLink.startsWith("http")
    ? companyLink
    : `${BASE_URL}${companyLink}`;
  const companyPage = await fetch(fullUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  }).then((r) => r.text());

  const $c = cheerio.load(companyPage);

  const overallRating =
    parseFloat($c('[data-test="rating-info"] .average').text()) || 0;

  const reviews = $c(".review-details")
    .map((_, el) => ({
      text: $c(el).find(".reviewText").text().trim(),
      rating: parseFloat($c(el).find(".ratingNumber").text()) || 0,
      date: $c(el).find(".date").text().trim(),
      pros: $c(el).find(".pros").text().trim(),
      cons: $c(el).find(".cons").text().trim(),
    }))
    .get();

  const companySize = $c('[data-test="employer-size"]').text().trim();
  const industry = $c('[data-test="employer-industry"]').text().trim();
  const founded = $c('[data-test="employer-founded"]').text().trim();

  return {
    source: "glassdoor",
    sector: "all",
    ratings: {
      overall: overallRating,
      culture: parseFloat($c('[data-test="rating-culture"]').text()) || 0,
      salary:
        parseFloat($c('[data-test="rating-compensation"]').text()) || 0,
    },
    reviews,
    companyInfo: {
      size: companySize || "",
      founded: founded || "",
      industry: industry || "",
    },
  };
}
