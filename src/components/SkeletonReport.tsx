export default function SkeletonReport() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-6 p-6">
      <div className="h-8 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-96 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
          >
            <div className="mb-3 h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 rounded bg-zinc-200 dark:bg-zinc-800"
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
          >
            <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
