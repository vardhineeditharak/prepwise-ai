"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { sanitizeInput, validateLength } from "@/lib/security";

interface Question {
  question: string;
  answer: string;
  category: string;
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
}

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const role = searchParams.get("role") || "Unknown Role";
  const experienceLevel = searchParams.get("experienceLevel") || "mid";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getQuestions = async () => {
      if (sessionId) {
        const { data } = await supabase
          .from("interview_sessions")
          .select("questions")
          .eq("id", sessionId)
          .single();

        if (data?.questions) {
          setQuestions(data.questions);
          setUserAnswers(new Array(data.questions.length).fill(""));
        }
      }
      setLoading(false);
    };
    getQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleNext = () => {
    // Sanitize user answer and restrict length to 4000 characters
    const sanitized = sanitizeInput(currentAnswer).substring(0, 4000);
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = sanitized;
    setUserAnswers(newAnswers);
    setCurrentAnswer("");
    setShowAnswer(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = async (finalAnswers: string[]) => {
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          answers: finalAnswers,
          role,
          experienceLevel,
          sessionId,
        }),
      });

      const analysis: Analysis = await res.json();

      if (sessionId) {
        await supabase
          .from("interview_sessions")
          .update({ analysis })
          .eq("id", sessionId);
      }

      const analysisWithAnswers = {
        ...analysis,
        answers: finalAnswers,
        questions: questions.map((q) => q.question),
      };

      sessionStorage.setItem("interviewAnalysis", JSON.stringify(analysisWithAnswers));
      router.push(`/practice/analysis?role=${encodeURIComponent(role)}`);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 rounded-xl bg-dove/30 mx-auto mb-3 shimmer-pulse" />
          <div className="h-4 w-64 rounded-lg bg-dove/20 mx-auto shimmer-pulse" />
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="w-full max-w-lg px-6">
          <phantom-ui loading animation="shimmer" duration={1.2}>
            <div>
              <div className="h-3 w-24 rounded bg-dove/30 mb-6" />
              <div className="h-32 w-full rounded-2xl bg-dove/20 mb-4" />
              <div className="h-24 w-full rounded-2xl bg-dove/20 mb-4" />
              <div className="flex gap-4">
                <div className="h-12 flex-1 rounded-full bg-dove/30" />
                <div className="h-12 flex-1 rounded-full bg-dove/20" />
              </div>
            </div>
          </phantom-ui>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-ash mb-4">No questions available.</p>
          <Link href="/practice" className="rounded-full bg-ink text-pure-white px-6 py-2 text-caption font-medium">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fog animate-fade-in">
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-graphite">
              {role} · Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-caption text-graphite">
              {currentQuestion.category}
            </span>
          </div>
          <div className="w-full h-1.5 bg-dove/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-rust rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-pure-white rounded-3xl shadow-card p-8 mb-6">
          <span className="inline-block rounded-full bg-sky-wash px-3 py-1 text-caption text-ink mb-4">
            {currentQuestion.category}
          </span>
          <h2 className="text-heading-sm font-display text-ink leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Input */}
        <div className="bg-pure-white rounded-3xl shadow-card p-6 mb-6">
          <label className="text-caption font-medium text-ink block mb-2">
            Your Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full rounded-2xl border border-dove bg-pure-white px-4 py-3 text-body text-ink placeholder:text-dove focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex-1 rounded-full border border-dove bg-pure-white text-ink px-6 py-3 text-body font-medium hover:bg-fog transition-colors"
          >
            {showAnswer ? "Hide Model Answer" : "Show Model Answer"}
          </button>
          <button
            onClick={handleNext}
            className="flex-1 rounded-full bg-ink text-pure-white px-6 py-3 text-body font-medium hover:opacity-90 transition-opacity"
          >
            {currentIndex >= questions.length - 1 ? "Finish & Analyze" : "Next Question"}
          </button>
        </div>

        {/* Model Answer */}
        {showAnswer && (
          <div className="mt-6 bg-pure-white rounded-3xl shadow-card p-6">
            <h3 className="text-body-lg font-medium text-ink mb-2">Model Answer</h3>
            <p className="text-body text-ash whitespace-pre-line">
              {currentQuestion.answer}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 rounded-xl bg-dove/30 mx-auto mb-3 shimmer-pulse" />
        </div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
