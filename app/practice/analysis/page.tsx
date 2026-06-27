"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import InterviewToneCard from "@/components/interview-tone-card";

interface ToneData {
  sentiment: { score: number; label: "positive" | "negative" | "neutral" };
  emotion: { joy: number; sadness: number; anger: number; fear: number };
  keywords: Array<{ text: string; relevance: number }>;
}

interface QuestionScore {
  questionIndex: number;
  score: number;
  feedback: string;
  modelAnswer: string;
}

interface Analysis {
  overallScore: number;
  questionScores: QuestionScore[];
  strengths: string[];
  improvements: string[];
  grade: string;
  answers: string[];
  questions: string[];
  toneAnalyses?: Array<{ questionIndex: number } & ToneData> | null;
}

type ViewMode = "combined" | "split";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Interview";
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("combined");

  useEffect(() => {
    const data = sessionStorage.getItem("interviewAnalysis");
    if (data) {
      setAnalysis(JSON.parse(data));
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center animate-fade-in">
        <div className="text-center px-6">
          <p className="text-body text-ash mb-4">No analysis data found.</p>
          <Link href="/practice" prefetch={true} className="rounded-full bg-ink text-pure-white px-6 py-2 text-caption font-medium">
            Start a Session
          </Link>
        </div>
      </div>
    );
  }

  const gradeColors: Record<string, string> = {
    A: "text-green-600 bg-green-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-yellow-600 bg-yellow-50",
    D: "text-orange-600 bg-orange-50",
    F: "text-red-600 bg-red-50",
  };

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (analysis.overallScore / 100) * circumference;

  const scoreColor =
    analysis.overallScore >= 80
      ? "#16a34a"
      : analysis.overallScore >= 60
      ? "#ca8a04"
      : "#dc2626";

  return (
    <div className="min-h-screen bg-fog animate-fade-in">
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-heading-sm md:text-heading font-display text-ink">
            Interview Analysis
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "combined" ? "split" : "combined")}
              className="rounded-full border border-dove bg-pure-white px-4 py-2 text-caption text-ink hover:bg-fog transition-colors"
            >
              {viewMode === "combined" ? "Split View" : "Combined"}
            </button>
            <button
              onClick={handlePrint}
              className="rounded-full border border-dove bg-pure-white px-4 py-2 text-caption text-ink hover:bg-fog transition-colors print:hidden"
            >
              <span className="hidden sm:inline">Download PDF</span>
              <svg className="h-4 w-4 sm:ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-pure-white rounded-3xl shadow-card p-6 md:p-8 text-center mb-6 md:mb-8">
          <h2 className="text-body-lg font-medium text-ink mb-4 md:mb-6">{role}</h2>
          <div className="relative w-32 h-32 md:w-36 md:h-36 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f7f7f8" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-heading-sm md:text-heading font-display text-ink">{analysis.overallScore}</span>
              <span className="text-caption text-graphite">/100</span>
            </div>
          </div>
          <span className={`inline-block rounded-full px-4 py-1 text-body font-medium ${gradeColors[analysis.grade] || ""}`}>
            Grade: {analysis.grade}
          </span>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-pure-white rounded-3xl shadow-card p-5 md:p-6">
            <h3 className="text-body font-medium text-ink mb-3">Strengths</h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-caption md:text-body text-ash">
                  <span className="text-green-600 mt-0.5 shrink-0">&#10003;</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-pure-white rounded-3xl shadow-card p-5 md:p-6">
            <h3 className="text-body font-medium text-ink mb-3">Areas for Improvement</h3>
            <ul className="space-y-2">
              {analysis.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-caption md:text-body text-ash">
                  <span className="text-yellow-600 mt-0.5 shrink-0">&#9888;</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-pure-white rounded-3xl shadow-card p-5 md:p-6 mb-6 md:mb-8">
          <h3 className="text-body-lg font-medium text-ink mb-4 md:mb-6">Question Breakdown</h3>
          <div className="space-y-6">
            {analysis.questionScores.map((qs, i) => (
              <div key={i} className="border-b border-fog pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-body font-medium text-ink">
                    Q{i + 1}: {analysis.questions[i]}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-caption font-medium ${
                      qs.score >= 80
                        ? "bg-green-50 text-green-700"
                        : qs.score >= 60
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {qs.score}/100
                  </span>
                </div>

                {viewMode === "split" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="rounded-xl bg-fog p-4">
                      <p className="text-caption text-graphite mb-1 font-medium">Your Answer:</p>
                      <p className="text-body text-ash">{analysis.answers[i] || "(no answer)"}</p>
                    </div>
                    <div className="rounded-xl bg-sky-wash p-4">
                      <p className="text-caption text-graphite mb-1 font-medium">Model Answer:</p>
                      <p className="text-body text-ash">{qs.modelAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl bg-fog p-4 mb-3">
                      <p className="text-caption text-graphite mb-1">Your Answer:</p>
                      <p className="text-body text-ash">{analysis.answers[i] || "(no answer)"}</p>
                    </div>
                    <p className="text-caption text-ash mb-2">
                      <span className="font-medium text-ink">Feedback:</span> {qs.feedback}
                    </p>
                    <div className="rounded-xl bg-sky-wash p-4">
                      <p className="text-caption text-graphite mb-1">Model Answer:</p>
                      <p className="text-body text-ash">{qs.modelAnswer}</p>
                    </div>
                  </>
                )}

                {analysis.toneAnalyses?.find((t) => t.questionIndex === i) && (
                  <InterviewToneCard
                    tone={analysis.toneAnalyses.find((t) => t.questionIndex === i)!}
                    questionLabel={`Q${i + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
          <Link
            href="/practice"
            prefetch={true}
            className="rounded-full bg-ink text-pure-white px-8 py-3 text-body font-medium hover:opacity-90 transition-opacity text-center"
          >
            Practice Again
          </Link>
          <Link
            href="/dashboard"
            prefetch={true}
            className="rounded-full border border-dove bg-pure-white text-ink px-8 py-3 text-body font-medium hover:bg-fog transition-colors text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 rounded-xl bg-dove/30 mx-auto mb-3 shimmer-pulse" />
          <div className="h-4 w-64 rounded-lg bg-dove/20 mx-auto shimmer-pulse" />
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
