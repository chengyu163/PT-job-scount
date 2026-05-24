"use client";

import { RedFlag } from "@/lib/types";
import { useLocale } from "./LocaleProvider";

interface RedFlagsProps {
  flags: RedFlag[];
}

export default function RedFlags({ flags }: RedFlagsProps) {
  const { t } = useLocale();

  const confidenceStyles = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  if (!flags?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
      <h3 className="mb-4 font-semibold text-red-800 dark:text-red-300">
        {t("redFlags")}
      </h3>
      <ul className="space-y-3">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 text-red-500">&#9888;</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {flag.issue}
                </span>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${confidenceStyles[flag.confidence]}`}>
                  {t(flag.confidence)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {t("sources")}: {flag.sources.join(", ")} · {flag.mentions} {t("mentions")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
