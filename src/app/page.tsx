"use client";

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
