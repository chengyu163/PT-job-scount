"use client";

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import CompanyGrid from "@/components/CompanyGrid";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-24">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("siteTitle")}
        </h1>
        <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
          {t("tagline")}
        </p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          {t("subtitle")}
        </p>
      </div>

      <SearchBar />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          {t("browseJobs")} &rarr;
        </Link>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
        >
          {t("interviewPrep")} &rarr;
        </Link>
        <Link
          href="/cover-letter"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
        >
          {t("coverLetterGen")} &rarr;
        </Link>
      </div>

      <CompanyGrid />

      <div className="mt-16 grid max-w-2xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
        <div>
          <div className="mb-2 text-3xl">&#128270;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("multiPlatform")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{t("multiPlatformDesc")}</p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#9888;&#65039;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("crossCheck")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{t("crossCheckDesc")}</p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#127757;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("foreignerTitle")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{t("foreignerDesc")}</p>
        </div>
      </div>
    </div>
  );
}
