import * as cheerio from "cheerio";
import { ScrapedData } from "../types";

const BASE_URL = "https://www.itjobs.pt";

export async function scrapeItjobs(
  companyName: string
): Promise<ScrapedData> {
  const searchUrl = `${BASE_URL}/empresa/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, "-"))}`;
  const page = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  }).then((r) => r.text());

  const $ = cheerio.load(page);

  const jobs = $(".list-group-item")
    .map((_, el) => {
      const title = $(el).find("h2, .title").text().trim();
      const techStack = $(el)
        .find(".badge, .tag")
        .map((__, tag) => $(tag).text().trim())
        .get();
      const location = $(el).find(".location").text().trim();
      const url = $(el).find("a").first().attr("href") || "";

      return {
        title,
        department: "IT",
        techStack,
        remote: location.toLowerCase().includes("remoto") || location.toLowerCase().includes("remote"),
        url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
      };
    })
    .get()
    .filter((j) => j.title);

  return {
    source: "itjobs",
    sector: "it",
    jobs,
  };
}
