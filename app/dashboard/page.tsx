"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScoreChart from "@/components/score-chart";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const [profileResult, sessionsResult, analysesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("resume_analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profileResult.data);
      setSessions(sessionsResult.data || []);
      setAnalyses(analysesResult.data || []);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-fog animate-fade-in">
        <main className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-10">
            <div className="h-10 w-64 rounded-2xl bg-dove/30 shimmer-pulse mb-3" />
            <div className="h-4 w-80 rounded-lg bg-dove/20 shimmer-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-pure-white shadow-card p-6">
                <div className="h-3 w-20 rounded bg-dove/20 shimmer-pulse mb-3" />
                <div className="h-8 w-16 rounded-xl bg-dove/30 shimmer-pulse" />
              </div>
            ))}
          </div>
          <div className="h-64 rounded-3xl bg-pure-white shadow-card shimmer-pulse" />
        </main>
      </div>
    );
  }

  const latestAnalysis = analyses[0];
  const avgScore = sessions.length > 0
    ? Math.round(
        sessions
          .filter((s) => s.analysis?.overallScore)
          .reduce((sum, s) => sum + s.analysis.overallScore, 0) /
          Math.max(sessions.filter((s) => s.analysis?.overallScore).length, 1)
      )
    : null;

  return (
    <div className="min-h-screen bg-fog animate-fade-in">
      <main className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
        <div className="mb-8 md:mb-10">
          <h1 className="text-heading-sm md:text-heading font-display text-ink">
            Welcome back, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-body text-ash mt-2">
            Here&apos;s your interview preparation overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatCard
            label="Sessions Completed"
            value={sessions.length.toString()}
            icon={
              <svg className="h-5 w-5 text-graphite shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <StatCard
            label="Average Score"
            value={avgScore !== null ? `${avgScore}/100` : "—"}
            icon={
              <svg className="h-5 w-5 text-graphite shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            label="Resume Score"
            value={latestAnalysis?.overall_score ? `${latestAnalysis.overall_score}/100` : "—"}
            icon={
              <svg className="h-5 w-5 text-graphite shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        {/* Score Chart */}
        <div className="mb-8 md:mb-12">
          <ScoreChart sessions={sessions} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-body-lg font-medium text-ink mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <ActionCard
              href="/resume-analysis"
              title="Analyze Resume"
              description="Get AI feedback on your resume"
              color="apricot"
            />
            <ActionCard
              href="/practice"
              title="Start Practice"
              description="Begin a new interview session"
              color="sky"
            />
            <ActionCard
              href="/coach"
              title="AI Coach"
              description="Chat with your interview coach"
              color="apricot"
            />
          </div>
        </div>

        {/* Resume Card + Sessions grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profile?.resume_image_url && (
            <div className="lg:col-span-1">
              <h2 className="text-body-lg font-medium text-ink mb-4">Your Resume</h2>
              <div className="bg-pure-white rounded-3xl shadow-card p-4">
                <img
                  src={profile.resume_image_url}
                  alt="Resume preview"
                  className="w-full rounded-2xl"
                  loading="lazy"
                />
                {profile.target_role && (
                  <p className="mt-3 text-caption text-ash text-center">
                    Targeting: <span className="text-ink font-medium">{profile.target_role}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className={profile?.resume_image_url ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-body-lg font-medium text-ink">Recent Sessions</h2>
              <Link
                href="/practice"
                prefetch={true}
                className="rounded-full bg-ink text-pure-white px-5 py-2 text-caption font-medium hover:opacity-90 transition-opacity"
              >
                New Session
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-pure-white rounded-3xl shadow-card p-12 text-center">
                <p className="text-body text-ash mb-4">No practice sessions yet.</p>
                <Link
                  href="/practice"
                  prefetch={true}
                  className="inline-block rounded-full bg-ink text-pure-white px-6 py-2 text-caption font-medium hover:opacity-90 transition-opacity"
                >
                  Start Your First Session
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="bg-pure-white rounded-3xl shadow-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h3 className="text-body font-medium text-ink truncate">{session.role}</h3>
                      <p className="text-caption text-ash capitalize">
                        {session.experience_level} level · {Array.isArray(session.questions) ? session.questions.length : 0} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {session.analysis?.overallScore && (
                        <span className={`rounded-full px-3 py-1 text-caption font-medium ${
                          session.analysis.overallScore >= 80
                            ? "bg-green-50 text-green-700"
                            : session.analysis.overallScore >= 60
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {session.analysis.overallScore}/100
                        </span>
                      )}
                      <span className="rounded-full bg-sky-wash px-3 py-1 text-caption text-ink">
                        {session.analysis ? "Analyzed" : "Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-pure-white rounded-3xl shadow-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-caption text-graphite uppercase tracking-wider truncate">{label}</p>
        {icon}
      </div>
      <p className="text-heading-sm font-display text-ink">{value}</p>
    </div>
  );
}

function ActionCard({ href, title, description, color }: { href: string; title: string; description: string; color: "apricot" | "sky" }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`block rounded-3xl p-5 md:p-6 transition-all hover:scale-[1.02] active:scale-[0.98] ${
        color === "apricot" ? "bg-apricot-wash" : "bg-sky-wash"
      }`}
    >
      <h3 className="text-body font-medium text-ink mb-1">{title}</h3>
      <p className="text-caption text-ash">{description}</p>
    </Link>
  );
}
