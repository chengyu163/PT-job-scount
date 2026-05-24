"use client";

import { CompanyReport } from "@/lib/types";
import ScoreGauge from "./ScoreGauge";
import SalaryRange from "./SalaryRange";
import RedFlags from "./RedFlags";
import ForeignerScore from "./ForeignerScore";

interface ReportCardProps {
  companyName: string;
  report: CompanyReport;
}

export default function ReportCard({ companyName, report }: ReportCardProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {companyName}
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          {report.summary}
        </p>
        {report.companyOverview.industry && (
          <p className="mt-1 text-sm text-zinc-500">
            {report.companyOverview.industry}
            {report.companyOverview.size &&
              ` · ${report.companyOverview.size} employees`}
            {report.companyOverview.founded &&
              ` · Founded ${report.companyOverview.founded}`}
          </p>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreGauge score={report.overallScore} label="Overall Score" />
        {report.culture.workLifeBalance !== null && (
          <ScoreGauge
            score={report.culture.workLifeBalance}
            label="Work-Life Balance"
          />
        )}
        {report.interview.difficulty !== null && (
          <ScoreGauge
            score={report.interview.difficulty}
            label="Interview Difficulty"
          />
        )}
      </div>

      {/* Tech Stack */}
      {report.companyOverview.techStack.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.companyOverview.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Salary */}
      <SalaryRange
        it={report.salary.it}
        business={report.salary.business}
        currency={report.salary.currency}
      />

      {/* Culture */}
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
          Work Culture
        </h3>
        {report.culture.positiveKeywords.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-sm text-zinc-500">Positives</p>
            <div className="flex flex-wrap gap-2">
              {report.culture.positiveKeywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/40 dark:text-green-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
        {report.culture.negativeKeywords.length > 0 && (
          <div>
            <p className="mb-1 text-sm text-zinc-500">Concerns</p>
            <div className="flex flex-wrap gap-2">
              {report.culture.negativeKeywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800 dark:bg-red-900/40 dark:text-red-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Red Flags */}
      <RedFlags flags={report.redFlags} />

      {/* Green Flags */}
      {report.greenFlags.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
          <h3 className="mb-3 font-semibold text-green-800 dark:text-green-300">
            Green Flags
          </h3>
          <ul className="space-y-1">
            {report.greenFlags.map((flag, i) => (
              <li
                key={i}
                className="text-sm text-green-700 dark:text-green-400"
              >
                &#10003; {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview */}
      {report.interview.process && (
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
            Interview Process
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {report.interview.process}
          </p>
          {report.interview.avgDuration && (
            <p className="mt-2 text-sm text-zinc-500">
              Average duration: {report.interview.avgDuration}
            </p>
          )}
          {report.interview.commonQuestions.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Common Questions
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {report.interview.commonQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Foreigner Friendly */}
      {report.foreignerFriendly && (
        <ForeignerScore data={report.foreignerFriendly} />
      )}

      {/* Review Authenticity */}
      {report.reviewAuthenticity && (
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Review Authenticity
            </h3>
            <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
              {report.reviewAuthenticity.score}/10
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Based on {report.reviewAuthenticity.totalReviews} reviews.{" "}
            {report.reviewAuthenticity.suspiciousPatterns
              ? "Suspicious patterns detected."
              : "No suspicious patterns."}{" "}
            {report.reviewAuthenticity.notes}
          </p>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
          AI Recommendation
        </h3>
        <p className="text-blue-900 dark:text-blue-200">
          {report.recommendation}
        </p>
      </div>
    </div>
  );
}
