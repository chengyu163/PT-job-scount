"use client";

import { CompanyReport } from "@/lib/types";
import { useLocale } from "./LocaleProvider";

interface OpenPositionsProps {
  positions: CompanyReport["openPositions"];
  trends: CompanyReport["hiringTrends"];
}

export default function OpenPositions({ positions, trends }: OpenPositionsProps) {
  const { t } = useLocale();

  if (!positions?.length && !trends) return null;

  return (
    <div className="space-y-4">
      {/* Hiring trends summary */}
      {trends && (
        <div className={`rounded-xl border p-6 ${
          trends.isHiring
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
            : "border-zinc-200 dark:border-zinc-800"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t("hiringTrends")}
            </h3>
            {trends.isHiring && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                {t("activelyHiring")}
              </span>
            )}
          </div>

          {trends.totalOpenings > 0 && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("totalOpenings")}: {trends.totalOpenings}
            </p>
          )}

          {trends.topRoles?.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-zinc-500">{t("topRoles")}</p>
              <div className="flex flex-wrap gap-2">
                {trends.topRoles.map((role) => (
                  <span key={role} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trends.techDemand?.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-zinc-500">{t("techDemand")}</p>
              <div className="flex flex-wrap gap-2">
                {trends.techDemand.map((tech) => (
                  <span key={tech} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trends.notes && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{trends.notes}</p>
          )}
        </div>
      )}

      {/* Open positions list */}
      {positions?.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            {t("openPositions")} ({positions.length})
          </h3>
          <div className="space-y-3">
            {positions.map((pos, i) => (
              <div key={i} className="flex items-start justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{pos.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    {pos.location && <span>{pos.location}</span>}
                    {pos.remote && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        Remote
                      </span>
                    )}
                    {pos.source && <span className="text-zinc-400">via {pos.source}</span>}
                  </div>
                </div>
                {pos.salaryRange && (
                  <span className="whitespace-nowrap text-sm font-medium text-green-700 dark:text-green-400">
                    {pos.salaryRange}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
