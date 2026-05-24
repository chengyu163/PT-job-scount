"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";

interface Company {
  name: string;
  slug: string;
  hasReport: boolean;
}

export default function CompanyGrid() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { locale, t } = useLocale();

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then(setCompanies)
      .catch(() => {});
  }, []);

  if (companies.length === 0) return null;

  const withReport = companies.filter((c) => c.hasReport);
  const popular = companies.filter((c) => !c.hasReport);

  return (
    <div className="mt-12 w-full max-w-3xl">
      {withReport.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("analyzedCompanies")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {withReport.map((c) => (
              <Link
                key={c.slug}
                href={`/company/${c.slug}?name=${encodeURIComponent(c.name)}&lang=${locale}`}
                className="group rounded-lg border border-zinc-200 bg-white px-4 py-3 text-center transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600"
              >
                <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  {c.name}
                </span>
                <span className="mt-1 block text-xs text-green-600 dark:text-green-400">
                  {t("reportReady")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("popularCompanies")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={`/company/${c.slug}?name=${encodeURIComponent(c.name)}&lang=${locale}`}
                className="group rounded-lg border border-zinc-200 bg-white px-4 py-3 text-center transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600"
              >
                <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
