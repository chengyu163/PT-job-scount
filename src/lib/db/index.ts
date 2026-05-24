import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDirectUrl(): string {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("prisma+postgres://")) {
    const match = url.match(/api_key=([A-Za-z0-9_=-]+)/);
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
      return decoded.databaseUrl;
    }
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getDirectUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
