"use client";

import { ForeignerFriendly } from "@/lib/types";
import { useLocale } from "./LocaleProvider";

interface ForeignerScoreProps {
  data: ForeignerFriendly;
}

export default function ForeignerScore({ data }: ForeignerScoreProps) {
  const { t } = useLocale();

  function BooleanIndicator({ value }: { value: boolean | null }) {
    if (value === null) return <span className="text-zinc-400">{t("unknown")}</span>;
    return value ? (
      <span className="text-green-600 dark:text-green-400">{t("yes")}</span>
    ) : (
      <span className="text-red-600 dark:text-red-400">{t("no")}</span>
    );
  }

  function EnvLevel({ level }: { level: "high" | "medium" | "low" | null }) {
    if (!level) return <span className="text-zinc-400">{t("unknown")}</span>;
    const styles = {
      high: "text-green-600 dark:text-green-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      low: "text-red-600 dark:text-red-400",
    };
    return <span className={styles[level]}>{t(level)}</span>;
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {t("foreignerFriendly")}
        </h3>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {data.score}/10
        </span>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("visaSupport")}</dt>
          <dd className="font-medium"><BooleanIndicator value={data.visaSupport} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("englishEnv")}</dt>
          <dd className="font-medium"><EnvLevel level={data.englishEnvironment} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("internationalTeam")}</dt>
          <dd className="font-medium"><BooleanIndicator value={data.internationalTeam} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("relocationSupport")}</dt>
          <dd className="font-medium"><BooleanIndicator value={data.relocationSupport} /></dd>
        </div>
      </dl>

      {data.notes && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{data.notes}</p>
      )}
    </div>
  );
}
