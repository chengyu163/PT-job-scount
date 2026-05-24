import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Job Scout Portugal
        </h1>
        <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
          Know before you sign
        </p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          AI-powered company intelligence for the Portuguese job market
        </p>
      </div>

      <SearchBar />

      <div className="mt-16 grid max-w-2xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
        <div>
          <div className="mb-2 text-3xl">&#128270;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Multi-Platform Data
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Aggregates Teamlyzer, Glassdoor, LinkedIn, and more
          </p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#9888;&#65039;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Red Flag Detection
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            AI cross-validates issues across platforms
          </p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#127757;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Foreigner Friendly
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Visa support, English environment, relocation info
          </p>
        </div>
      </div>
    </div>
  );
}
