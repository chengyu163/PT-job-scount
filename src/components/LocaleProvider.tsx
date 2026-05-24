"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, LOCALES, t, TranslationKey } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "zh",
  setLocale: () => {},
  t: (key) => key,
});

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && LOCALES.some((l) => l.code === saved)) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => t(locale, key) }}>
      {children}
    </LocaleContext.Provider>
  );
}
