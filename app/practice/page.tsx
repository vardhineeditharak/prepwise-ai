"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { validateRole } from "@/lib/security";

interface Question {
  question: string;
  answer: string;
  category: string;
}

export default function PracticePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    const getUser = async () => {
      const { data: { user } } = await client.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await client
          .from("profiles")
          .select("target_role, experience_level, resume_text")
          .eq("id", user.id)
          .single();
        if (data) {
          setRole(data.target_role || "");
          setExperienceLevel(data.experience_level || "mid");
          setProfile(data);
        }
      }
    };
    getUser();
  }, []);

  const handleStart = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError(null);

    const cleanRole = role.trim();
    if (!validateRole(cleanRole)) {
      setError("Please enter a valid target role (alphanumeric, spaces, dashes, commas, parentheses only, max 100 characters).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: cleanRole,
          experienceLevel,
          resumeText: profile?.resume_text,
        }),
      });

      const questions: Question[] = await res.json();

      if (user && supabase) {
        const { data: session } = await supabase
          .from("interview_sessions")
          .insert({
            user_id: user.id,
            role: cleanRole,
            experience_level: experienceLevel,
            questions,
            resume_context: profile?.resume_text,
          })
          .select()
          .single();

        if (session) {
          const params = new URLSearchParams({
            sessionId: session.id,
            role: cleanRole,
            experienceLevel,
          });
          router.push(`/practice/session?${params.toString()}`);
        }
      } else {
        // Not logged in — just go to session with questions in URL (not ideal but works)
        router.push(`/practice/session?role=${encodeURIComponent(cleanRole)}`);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fog animate-fade-in">
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-heading font-display text-ink text-center mb-2">
            Start Practicing
          </h1>
          <p className="text-body text-ash text-center mb-10">
            Tell us about the role you are preparing for, and we will generate
            tailored interview questions.
          </p>

          <div className="bg-pure-white rounded-3xl shadow-card p-8">
            <div className="space-y-6">
              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
                  className="w-full rounded-2xl border border-dove bg-pure-white px-4 py-3 text-body text-ink placeholder:text-dove focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust"
                />
              </div>

              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-2xl border border-dove bg-pure-white px-4 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust"
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6-10 years)</option>
                  <option value="lead">Lead / Principal (10+ years)</option>
                </select>
              </div>

              {profile?.resume_text && (
                <div className="rounded-2xl bg-sky-wash p-4">
                  <p className="text-caption text-ink">
                    Your resume is linked. Questions will be tailored to your experience.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-caption text-red-600">{error}</p>
              )}

              <button
                onClick={handleStart}
                disabled={!role.trim() || loading}
                className="w-full rounded-full bg-ink text-pure-white px-6 py-3 text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Generating Questions..." : "Start Interview"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
