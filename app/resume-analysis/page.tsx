"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ResumeUpload } from "@/components/resume-upload";
import { ResumeAnalysisReport } from "@/components/resume-analysis-report";
import { validateRole } from "@/lib/security";

interface ResumeData {
  text: string;
  markdown: string;
  imageUrl: string;
}

interface AnalysisResult {
  overallScore: number;
  skillGaps: { skill: string; status: "strong" | "weak" | "missing" }[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export default function ResumeAnalysisPage() {
  const [user, setUser] = useState<any>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    const getUser = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

        const { data } = await client
          .from("profiles")
          .select("resume_text, resume_image_url, target_role, experience_level")
          .eq("id", user.id)
          .single();
      if (data?.resume_text) {
        setResumeData({
          text: data.resume_text,
          markdown: data.resume_text,
          imageUrl: data.resume_image_url || "",
        });
        setTargetRole(data.target_role || "");
        setExperienceLevel(data.experience_level || "mid");
      }
    };
    getUser();
  }, []);

  const handleResumeUpload = useCallback((data: ResumeData) => {
    setResumeData(data);
    setAnalysis(null);
  }, []);

  const handleAnalyze = async () => {
    if (!resumeData || !targetRole.trim()) return;
    setAnalyzing(true);
    setError(null);

    const cleanRole = targetRole.trim();
    if (!validateRole(cleanRole)) {
      setError("Please enter a valid target role (alphanumeric, spaces, dashes, commas, parentheses only, max 100 characters).");
      setAnalyzing(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeData.text,
          targetRole: cleanRole,
          experienceLevel,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const result = await res.json();
      setAnalysis(result);

      // Save to database
      if (user && supabase) {
        await supabase.from("resume_analyses").insert({
          user_id: user.id,
          target_role: cleanRole,
          overall_score: result.overallScore,
          skill_gaps: result.skillGaps,
          strengths: result.strengths,
          improvements: result.improvements,
          recommendations: result.recommendations,
          resume_text: resumeData.text,
        });

        await supabase
          .from("profiles")
          .update({
            resume_text: resumeData.text,
            resume_markdown: resumeData.markdown,
            resume_image_url: resumeData.imageUrl,
            target_role: cleanRole,
            experience_level: experienceLevel,
          })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-fog animate-fade-in">
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-heading font-display text-ink">Resume Analysis</h1>
          <p className="text-body text-ash mt-2">
            Upload your resume and get AI-powered feedback matched to your target role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload + Config */}
          <div className="space-y-6">
            <div className="bg-pure-white rounded-3xl shadow-card p-6">
              <h2 className="text-subheading font-medium text-ink mb-4">Upload Resume</h2>
              <ResumeUpload onUpload={handleResumeUpload} />
            </div>

            {resumeData && (
              <div className="bg-pure-white rounded-3xl shadow-card p-6">
                <h2 className="text-subheading font-medium text-ink mb-4">Target Role</h2>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    setAnalysis(null);
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-2xl border border-dove bg-pure-white px-4 py-3 text-body text-ink placeholder:text-dove focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust mb-4"
                />
                <label className="text-caption font-medium text-ink block mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    setAnalysis(null);
                  }}
                  className="w-full rounded-2xl border border-dove bg-pure-white px-4 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Principal</option>
                </select>

                <button
                  onClick={handleAnalyze}
                  disabled={!targetRole.trim() || analyzing}
                  className="mt-6 w-full rounded-full bg-ink text-pure-white px-6 py-3 text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {analyzing ? "Analyzing..." : "Analyze Resume"}
                </button>

                {error && (
                  <p className="mt-3 text-caption text-red-600">{error}</p>
                )}
              </div>
            )}

            {/* Resume preview */}
            {resumeData?.imageUrl && (
              <div className="bg-pure-white rounded-3xl shadow-card p-4">
                <img
                  src={resumeData.imageUrl}
                  alt="Resume preview"
                  className="w-full max-w-sm mx-auto rounded-2xl"
                />
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {analyzing ? (
              <div className="bg-pure-white rounded-3xl shadow-card p-12">
                <phantom-ui loading animation="shimmer" duration={1.2}>
                  <div>
                    <div className="h-3 w-24 rounded bg-dove/30 mb-4" />
                    <div className="flex items-center justify-center mb-8">
                      <div className="h-24 w-24 rounded-full bg-dove/20" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded bg-dove/30" />
                      <div className="h-4 w-3/4 rounded bg-dove/20" />
                      <div className="h-4 w-5/6 rounded bg-dove/30" />
                      <div className="h-4 w-2/3 rounded bg-dove/20" />
                    </div>
                  </div>
                </phantom-ui>
              </div>
            ) : analysis ? (
              <ResumeAnalysisReport analysis={analysis} />
            ) : (
              <div className="bg-pure-white rounded-3xl shadow-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-fog mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-body text-ash">
                  Upload your resume and enter a target role to see AI-powered analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
