"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const PT_COMPANIES = [
  "Tripadvisor",
  "Farfetch",
  "OutSystems",
  "Talkdesk",
  "Feedzai",
  "Unbabel",
  "Sword Health",
  "Remote",
  "Cloudflare",
  "Datadog",
  "Revolut",
  "Wise",
  "Mercedes-Benz.io",
  "Siemens",
  "Bosch",
  "Volkswagen Digital Solutions",
  "Critical TechWorks",
  "Natixis",
  "BNP Paribas",
  "Capgemini",
  "Deloitte",
  "Accenture",
  "KPMG",
  "EY",
  "PwC",
  "McKinsey",
  "Cisco",
  "Google",
  "Microsoft",
  "Amazon",
  "Blip",
  "Sky Technology Centre",
  "Miniclip",
  "Novabase",
  "Altice Labs",
  "Celfocus",
  "WeDo Technologies",
  "Infraspeak",
  "Codacy",
  "Rows",
  "Aptoide",
  "Prozis",
  "Coverflex",
  "Gympass",
  "Salsify",
  "Dashlane",
];

interface CompanyStatus {
  id: string;
  name: string;
  slug: string;
  lastReport: string | null;
  reportExpired: boolean;
  score: number | null;
  lastScraped: string | null;
}

type JobStatus = "idle" | "running" | "done" | "error";

interface QueueItem {
  company: string;
  status: JobStatus;
  score?: number;
  error?: string;
}

export default function AdminPage() {
  const [dbCompanies, setDbCompanies] = useState<CompanyStatus[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customCompany, setCustomCompany] = useState("");
  const abortRef = useRef(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setDbCompanies(data.companies || []);
    } catch {
      // silent
    }
  }

  function addToQueue(companies: string[]) {
    const existing = new Set(queue.map((q) => q.company.toLowerCase()));
    const newItems: QueueItem[] = companies
      .filter((c) => !existing.has(c.toLowerCase()))
      .map((c) => ({ company: c, status: "idle" as JobStatus }));
    setQueue((prev) => [...prev, ...newItems]);
  }

  function addMissing() {
    const dbSlugs = new Set(dbCompanies.map((c) => c.slug));
    const missing = PT_COMPANIES.filter(
      (c) => !dbSlugs.has(c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    );
    addToQueue(missing);
  }

  function addExpired() {
    const expired = dbCompanies.filter((c) => c.reportExpired).map((c) => c.name);
    addToQueue(expired);
  }

  const processQueue = useCallback(async () => {
    setIsRunning(true);
    abortRef.current = false;

    for (let i = 0; i < queue.length; i++) {
      if (abortRef.current) break;
      if (queue[i].status !== "idle") continue;

      setQueue((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "running" } : item))
      );

      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: queue[i].company, lang: "zh" }),
        });
        const data = await res.json();

        if (res.ok) {
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "done", score: data.score } : item
            )
          );
        } else {
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error", error: data.error } : item
            )
          );
        }
      } catch (e) {
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "error", error: String(e) } : item
          )
        );
      }

      // Delay between companies to avoid rate limiting
      if (!abortRef.current && i < queue.length - 1) {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    setIsRunning(false);
    fetchCompanies();
  }, [queue]);

  function stopProcessing() {
    abortRef.current = true;
  }

  function clearQueue() {
    setQueue([]);
  }

  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const pendingCount = queue.filter((q) => q.status === "idle").length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-sm font-medium text-blue-600 dark:text-blue-400">
            &larr; Back
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Admin Dashboard</h1>
          <div className="text-xs text-zinc-400">
            {dbCompanies.length} companies in DB
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Controls */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Batch Processing</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={addMissing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Missing Companies ({PT_COMPANIES.length - dbCompanies.length})
            </button>
            <button
              onClick={addExpired}
              className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
            >
              + Add Expired Reports ({dbCompanies.filter((c) => c.reportExpired).length})
            </button>
            <button
              onClick={() => addToQueue(PT_COMPANIES)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
            >
              + Add All ({PT_COMPANIES.length})
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="Custom company name..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && customCompany.trim()) {
                  addToQueue([customCompany.trim()]);
                  setCustomCompany("");
                }
              }}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button
              onClick={() => {
                if (customCompany.trim()) {
                  addToQueue([customCompany.trim()]);
                  setCustomCompany("");
                }
              }}
              className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Queue ({queue.length}) — Done: {doneCount} | Errors: {errorCount} | Pending: {pendingCount}
              </h2>
              <div className="flex gap-2">
                {!isRunning ? (
                  <button
                    onClick={processQueue}
                    disabled={pendingCount === 0}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Start Processing
                  </button>
                ) : (
                  <button
                    onClick={stopProcessing}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={clearQueue}
                  disabled={isRunning}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {queue.length > 0 && (
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${((doneCount + errorCount) / queue.length) * 100}%` }}
                />
              </div>
            )}

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {queue.map((item, i) => (
                <div
                  key={`${item.company}-${i}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-zinc-800 dark:text-zinc-200">{item.company}</span>
                  <div className="flex items-center gap-2">
                    {item.score && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Score: {item.score}
                      </span>
                    )}
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DB Companies */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
            Companies in Database ({dbCompanies.length})
          </h2>
          {dbCompanies.length === 0 ? (
            <p className="text-sm text-zinc-500">No companies yet. Add some above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-700">
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Score</th>
                    <th className="pb-2 font-medium">Last Report</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbCompanies.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2 font-medium text-zinc-900 dark:text-zinc-100">
                        {c.name}
                      </td>
                      <td className="py-2">
                        {c.score ? (
                          <span className={`font-bold ${c.score >= 7 ? "text-green-600" : c.score >= 5 ? "text-yellow-600" : "text-red-600"}`}>
                            {c.score}/10
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-2 text-zinc-500">
                        {c.lastReport ? new Date(c.lastReport).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-2">
                        {c.reportExpired ? (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                            Expired
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-2 flex items-center gap-3">
                        <Link
                          href={`/company/${c.slug}?name=${encodeURIComponent(c.name)}&lang=zh`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => addToQueue([c.name])}
                          className="text-orange-600 hover:underline dark:text-orange-400"
                        >
                          Refresh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  switch (status) {
    case "running":
      return (
        <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          Running
        </span>
      );
    case "done":
      return <span className="text-xs text-green-600 dark:text-green-400">Done</span>;
    case "error":
      return <span className="text-xs text-red-600 dark:text-red-400">Failed</span>;
    default:
      return <span className="text-xs text-zinc-400">Pending</span>;
  }
}
