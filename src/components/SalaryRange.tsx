"use client";

import { useLocale } from "./LocaleProvider";

interface SalaryRole {
  role: string;
  min: number;
  max: number;
  source: string;
}

interface SalaryRangeProps {
  roles: SalaryRole[];
  currency: string;
}

function formatSalary(value: number, currency: string): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalaryRange({ roles, currency }: SalaryRangeProps) {
  const { t } = useLocale();

  if (!roles || roles.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{t("salary")}</h3>
        <p className="mt-2 text-sm text-zinc-500">—</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">{t("salary")}</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-700">
            <th className="pb-2 font-medium">{t("roleName")}</th>
            <th className="pb-2 font-medium">{t("salary")}</th>
            <th className="pb-2 font-medium">{t("sources")}</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r, i) => (
            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2.5 pr-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {r.role}
              </td>
              <td className="py-2.5 text-sm text-zinc-900 dark:text-zinc-100">
                {formatSalary(r.min, currency)} &ndash; {formatSalary(r.max, currency)}
              </td>
              <td className="py-2.5 text-xs text-zinc-400">{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
