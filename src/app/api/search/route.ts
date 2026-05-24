import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ companies: [] });
  }

  const companies = await prisma.company.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, slug: true },
    take: 10,
  });

  return NextResponse.json({ companies });
}
