"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { ScoredJob } from "@/lib/types";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7.5
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : score >= 5
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "";
  const fmt = (v: number) => `€${(v / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min || max || 0);
}

export default function JobsPage() {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterRemote, setFilterRemote] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  const displayed = filterRemote ? jobs.filter((j) => j.remote) : jobs;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            &larr; {t("backToSearch")}
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t("jobBoard")}
          </h1>
          <div />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder={t("searchJobs")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            onClick={() => setFilterRemote(!filterRemote)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              filterRemote
                ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            Remote
          </button>
        </div>

        {/* Score legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>{t("scoreWeights")}: </span>
          <span>{t("salaryW")} 35%</span>
          <span>{t("companyW")} 30%</span>
          <span>{t("techW")} 20%</span>
          <span>{t("remoteW")} 15%</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400">{t("searching")}</div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-zinc-500">{t("noJobs")}</p>
            <p className="mt-2 text-sm text-zinc-400">{t("noJobsHint")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              {displayed.length} {t("positionsFound")}
            </p>
            {displayed.map((job, i) => (
              <div
                key={`${job.title}-${job.company}-${i}`}
                className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Score */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <ScoreBadge score={job.score} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {job.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        {job.hasReport ? (
                          <Link
                            href={`/company/${job.company.toLowerCase().replace(/\s+/g, "-")}?name=${encodeURIComponent(job.company)}`}
                            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {job.company}
                          </Link>
                        ) : (
                          <span className="text-zinc-600 dark:text-zinc-400">{job.company}</span>
                        )}
                        <span className="text-zinc-400">·</span>
                        <span className="text-zinc-500">{job.location}</span>
                        {job.remote && (
                          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="whitespace-nowrap text-sm font-semibold text-green-700 dark:text-green-400">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    )}
                  </div>

                  {/* Tech stack */}
                  {job.techStack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.techStack.slice(0, 8).map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Score breakdown */}
                  <div className="mt-2 flex gap-3 text-xs text-zinc-400">
                    <span>{t("salaryShort")}: {job.scoreBreakdown.salaryScore.toFixed(1)}</span>
                    <span>{t("companyShort")}: {job.scoreBreakdown.companyScore.toFixed(1)}</span>
                    <span>{t("techShort")}: {job.scoreBreakdown.techScore.toFixed(1)}</span>
                    {job.companyRating && (
                      <span className="text-zinc-500">
                        {t("companyRating")}: {job.companyRating.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    {t("viewJob")}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
