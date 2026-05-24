import { Redis } from "@upstash/redis";
import { CompanyReport } from "./types";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  }
  return null;
}

const CACHE_TTL = 7 * 24 * 60 * 60;

function cacheKey(companySlug: string): string {
  return `report:${companySlug}`;
}

export async function getCachedReport(
  companySlug: string
): Promise<CompanyReport | null> {
  const r = getRedis();
  if (!r) return null;

  try {
    return await r.get<CompanyReport>(cacheKey(companySlug));
  } catch {
    return null;
  }
}

export async function setCachedReport(
  companySlug: string,
  report: CompanyReport
): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    await r.set(cacheKey(companySlug), report, { ex: CACHE_TTL });
  } catch {
    // non-critical
  }
}
