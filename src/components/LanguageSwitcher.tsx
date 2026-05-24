"use client";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-1 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            locale === l.code
              ? "bg-blue-600 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
