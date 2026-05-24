import { RedFlag } from "@/lib/types";

interface RedFlagsProps {
  flags: RedFlag[];
}

function confidenceBadge(confidence: RedFlag["confidence"]) {
  const styles = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[confidence]}`}
    >
      {confidence}
    </span>
  );
}

export default function RedFlags({ flags }: RedFlagsProps) {
  if (!flags.length) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
        <h3 className="font-semibold text-green-800 dark:text-green-300">
          No Red Flags Detected
        </h3>
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          No recurring negative patterns found across platforms.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
      <h3 className="mb-4 font-semibold text-red-800 dark:text-red-300">
        Red Flags
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
                {confidenceBadge(flag.confidence)}
              </div>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Mentioned {flag.mentions} times across{" "}
                {flag.sources.join(", ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
