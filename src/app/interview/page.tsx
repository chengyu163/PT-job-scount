"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

interface InterviewQuestion {
  question: string;
  tip: string;
  difficulty?: string;
}

interface InterviewPrep {
  company: string;
  role: string;
  overview: string;
  technicalQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  companySpecific: InterviewQuestion[];
  questionsToAsk: string[];
  preparationTips: string[];
  commonMistakes: string[];
  salaryNegotiation: {
    tips: string[];
    marketRange: string;
  };
}

function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === "hard"
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : level === "medium"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {level}
    </span>
  );
}

export default function InterviewPage() {
  const { t, locale } = useLocale();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [prep, setPrep] = useState<InterviewPrep | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    setPrep(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim(), role: role.trim(), locale }),
      });
      const data = await res.json();
      setPrep(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            &larr; {t("backToSearch")}
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t("interviewPrep")}
          </h1>
          <div />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <form onSubmit={handleGenerate} className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder={t("companyName")}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <input
            type="text"
            placeholder={t("roleName")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !company.trim() || !role.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("generating") : t("generatePrep")}
          </button>
        </form>

        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-zinc-500">{t("generatingInterview")}</p>
          </div>
        )}

        {prep && (
          <div className="space-y-8">
            {/* Overview */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-700 dark:text-zinc-300">{prep.overview}</p>
            </div>

            {/* Technical Questions */}
            <Section title={t("technicalQuestions")}>
              {prep.technicalQuestions.map((q, i) => (
                <QuestionCard key={i} question={q.question} tip={q.tip} difficulty={q.difficulty} />
              ))}
            </Section>

            {/* Behavioral Questions */}
            <Section title={t("behavioralQuestions")}>
              {prep.behavioralQuestions.map((q, i) => (
                <QuestionCard key={i} question={q.question} tip={q.tip} />
              ))}
            </Section>

            {/* Company Specific */}
            <Section title={t("companySpecificQ")}>
              {prep.companySpecific.map((q, i) => (
                <QuestionCard key={i} question={q.question} tip={q.tip} />
              ))}
            </Section>

            {/* Questions to Ask */}
            <Section title={t("questionsToAsk")}>
              <ul className="space-y-2">
                {prep.questionsToAsk.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-0.5 text-blue-500">&#8226;</span>
                    {q}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Preparation Tips */}
            <Section title={t("prepTips")}>
              <ul className="space-y-2">
                {prep.preparationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-0.5 text-green-500">&#10003;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Common Mistakes */}
            <Section title={t("commonMistakes")}>
              <ul className="space-y-2">
                {prep.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-0.5 text-red-500">&#10007;</span>
                    {m}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Salary Negotiation */}
            <Section title={t("salaryNegotiation")}>
              <p className="mb-3 text-sm font-medium text-green-700 dark:text-green-400">
                {t("marketRange")}: {prep.salaryNegotiation.marketRange}
              </p>
              <ul className="space-y-2">
                {prep.salaryNegotiation.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-0.5 text-yellow-500">&#9733;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      {children}
    </div>
  );
}

function QuestionCard({ question, tip, difficulty }: { question: string; tip: string; difficulty?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {question}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {difficulty && <DifficultyBadge level={difficulty} />}
          <span className="text-xs text-zinc-400">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {tip}
        </p>
      )}
    </div>
  );
}
