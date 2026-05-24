import * as cheerio from "cheerio";
import { ScrapedData } from "../types";

const BASE_URL = "https://pt.teamlyzer.com";

export async function scrapeTeamlyzer(
  companyName: string
): Promise<ScrapedData> {
  const searchUrl = `${BASE_URL}/management/companies?q=${encodeURIComponent(companyName)}`;
  const searchPage = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  }).then((r) => r.text());

  const $ = cheerio.load(searchPage);
  const companyLink = $('a[href*="/management/company/"]')
    .first()
    .attr("href");

  if (!companyLink) {
    return { source: "teamlyzer", sector: "it" };
  }

  const companyPage = await fetch(`${BASE_URL}${companyLink}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  }).then((r) => r.text());

  const $c = cheerio.load(companyPage);

  return {
    source: "teamlyzer",
    sector: "it",
    ratings: {
      overall: parseFloat($c(".rating-overall").text()) || 0,
      culture: parseFloat($c(".rating-culture").text()) || 0,
      salary: parseFloat($c(".rating-salary").text()) || 0,
    },
    reviews: $c(".review-item")
      .map((_, el) => ({
        text: $c(el).find(".review-text").text().trim(),
        rating: parseFloat($c(el).find(".review-rating").text()) || 0,
        date: $c(el).find(".review-date").text().trim(),
        pros: $c(el).find(".pros").text().trim(),
        cons: $c(el).find(".cons").text().trim(),
      }))
      .get(),
  };
}
