"use client";

import { SalaryByLevel } from "@/lib/types";
import { useLocale } from "./LocaleProvider";

interface SalaryRangeProps {
  it: SalaryByLevel | null;
  business: SalaryByLevel | null;
  currency: string;
}

function formatSalary(value: number, currency: string): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalaryRange({ it, business, currency }: SalaryRangeProps) {
  const { t } = useLocale();

  function SalaryRow({ label, range }: { label: string; range: { min: number; max: number } | null }) {
    if (!range || (range.min === 0 && range.max === 0)) {
      return (
        <tr>
          <td className="py-2 pr-4 text-sm text-zinc-500">{label}</td>
          <td className="py-2 text-sm text-zinc-400">—</td>
        </tr>
      );
    }
    return (
      <tr>
        <td className="py-2 pr-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</td>
        <td className="py-2 text-sm text-zinc-900 dark:text-zinc-100">
          {formatSalary(range.min, currency)} &ndash; {formatSalary(range.max, currency)}
        </td>
      </tr>
    );
  }

  function SalaryTable({ title, data }: { title: string; data: SalaryByLevel }) {
    return (
      <div>
        <h4 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">{title}</h4>
        <table className="w-full">
          <tbody>
            <SalaryRow label={t("junior")} range={data.junior} />
            <SalaryRow label={t("mid")} range={data.mid} />
            <SalaryRow label={t("senior")} range={data.senior} />
          </tbody>
        </table>
      </div>
    );
  }

  if (!it && !business) {
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {it && <SalaryTable title={t("salaryIt")} data={it} />}
        {business && <SalaryTable title={t("salaryBusiness")} data={business} />}
      </div>
    </div>
  );
}
