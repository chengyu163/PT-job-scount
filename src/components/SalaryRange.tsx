import { SalaryByLevel } from "@/lib/types";

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

function SalaryRow({
  label,
  range,
  currency,
}: {
  label: string;
  range: { min: number; max: number } | null;
  currency: string;
}) {
  if (!range || (range.min === 0 && range.max === 0)) {
    return (
      <tr>
        <td className="py-2 pr-4 text-sm text-zinc-500">{label}</td>
        <td className="py-2 text-sm text-zinc-400">No data</td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="py-2 pr-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </td>
      <td className="py-2 text-sm text-zinc-900 dark:text-zinc-100">
        {formatSalary(range.min, currency)} &ndash;{" "}
        {formatSalary(range.max, currency)}
      </td>
    </tr>
  );
}

function SalaryTable({
  title,
  data,
  currency,
}: {
  title: string;
  data: SalaryByLevel;
  currency: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        {title}
      </h4>
      <table className="w-full">
        <tbody>
          <SalaryRow label="Junior" range={data.junior} currency={currency} />
          <SalaryRow label="Mid-level" range={data.mid} currency={currency} />
          <SalaryRow label="Senior" range={data.senior} currency={currency} />
        </tbody>
      </table>
    </div>
  );
}

export default function SalaryRange({
  it,
  business,
  currency,
}: SalaryRangeProps) {
  if (!it && !business) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Salary Ranges
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          No salary data available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
        Salary Ranges (Annual Gross)
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {it && <SalaryTable title="IT / Tech" data={it} currency={currency} />}
        {business && (
          <SalaryTable title="Business" data={business} currency={currency} />
        )}
      </div>
    </div>
  );
}
