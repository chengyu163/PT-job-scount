interface ScoreGaugeProps {
  score: number;
  label: string;
  maxScore?: number;
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return "text-green-600 dark:text-green-400";
  if (pct >= 0.4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return "bg-green-100 dark:bg-green-900/30";
  if (pct >= 0.4) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

export default function ScoreGauge({
  score,
  label,
  maxScore = 10,
}: ScoreGaugeProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 p-6 dark:border-zinc-800 ${getScoreBg(score, maxScore)}`}
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-4xl font-bold ${getScoreColor(score, maxScore)}`}>
        {(score ?? 0).toFixed(1)}
        <span className="text-lg font-normal text-zinc-400">/{maxScore}</span>
      </p>
    </div>
  );
}
