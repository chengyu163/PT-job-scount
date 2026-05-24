"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CompanyReport } from "@/lib/types";
import ReportCard from "@/components/ReportCard";
import SkeletonReport from "@/components/SkeletonReport";
import Link from "next/link";

export default function CompanyPage() {
  const searchParams = useSearchParams();
  const companyName = searchParams.get("name") || "";

  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyName) {
      setError("No company name provided");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(
          `/api/report?company=${encodeURIComponent(companyName)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to generate report");
          return;
        }

        setReport(data.report);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [companyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <nav className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            &larr; Back to search
          </Link>
        </nav>
        <div className="py-8">
          <p className="mb-4 text-center text-sm text-zinc-500">
            Scouting {companyName}... This may take up to 30 seconds.
          </p>
          <SkeletonReport />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Could not generate report
        </h1>
        <p className="mt-2 text-zinc-500">{error}</p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Try another company
        </Link>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          &larr; Back to search
        </Link>
      </nav>
      <ReportCard companyName={companyName} report={report} />
    </div>
  );
}
