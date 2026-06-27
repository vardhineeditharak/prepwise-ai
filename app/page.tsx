"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function HeroPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="min-h-screen bg-pure-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Warm radial glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[800px] h-[600px] rounded-full opacity-30 blur-3xl"
            style={{
              background: "radial-gradient(circle, #fbe1d1 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-32 text-center">
          <h1 className="text-heading-lg font-display text-ink leading-[1.1] tracking-[-0.025em] mb-6">
            Ace Your Next
            <br />
            <span className="text-rust">Interview</span>
          </h1>
          <p className="text-body-lg text-ash max-w-xl mx-auto mb-10">
            Upload your resume, get AI-powered analysis, practice with tailored
            questions, and receive real-time feedback — all powered by IBM Granite.
          </p>

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-ink text-pure-white px-8 py-3 text-body font-medium hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth?mode=signup"
                  className="rounded-full bg-ink text-pure-white px-8 py-3 text-body font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full text-ink px-8 py-3 text-body font-medium hover:bg-fog transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Floating cards */}
          <div className="relative mt-16 mx-auto max-w-[900px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resume Card */}
              <div className="bg-pure-white rounded-3xl shadow-card p-6 text-left transform md:-rotate-2 md:hover:rotate-0 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full bg-apricot-wash flex items-center justify-center mb-4">
                  <svg className="h-5 w-5 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-body font-medium text-ink mb-1">Resume Analysis</h3>
                <p className="text-caption text-ash">
                  Get instant feedback on your resume matched against your target role.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-sky-wash px-2 py-0.5 text-[12px] text-ink">React</span>
                  <span className="rounded-full bg-sky-wash px-2 py-0.5 text-[12px] text-ink">TypeScript</span>
                  <span className="rounded-full bg-fog px-2 py-0.5 text-[12px] text-graphite">+5</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-pure-white rounded-3xl shadow-card p-6 text-left transform md:translate-y-4 md:hover:translate-y-2 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full bg-sky-wash flex items-center justify-center mb-4">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-body font-medium text-ink mb-1">Interview Score</h3>
                <p className="text-caption text-ash">
                  Real-time scoring and feedback after every practice session.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-heading-sm font-display text-ink">87</span>
                  <span className="text-caption text-graphite">/100</span>
                  <span className="ml-2 text-caption text-green-600">+12</span>
                </div>
              </div>

              {/* Chat Card */}
              <div className="bg-pure-white rounded-3xl shadow-card p-6 text-left transform md:rotate-2 md:hover:rotate-0 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full bg-apricot-wash flex items-center justify-center mb-4">
                  <svg className="h-5 w-5 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-body font-medium text-ink mb-1">AI Coach</h3>
                <p className="text-caption text-ash">
                  Chat with an AI interview coach for personalized tips and practice.
                </p>
                <div className="mt-4 rounded-xl bg-fog p-3">
                  <p className="text-[12px] text-ash italic">
                    &ldquo;How should I answer behavioral questions?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-fog py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-heading font-display text-ink text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-body text-ash text-center mb-16 max-w-lg mx-auto">
            A complete interview preparation toolkit powered by IBM Granite AI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="h-6 w-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Resume Analysis"
              description="Upload your PDF resume and get AI-powered analysis against your target role. See skill gaps, strengths, and personalized recommendations."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Tailored Questions"
              description="Get interview questions generated specifically for your role, experience level, and resume content using IBM Granite AI."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="AI Chat Coach"
              description="Practice with an AI coach that adapts to your skill level. Get suggestions, learn STAR method answers, and build confidence."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-pure-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-heading font-display text-ink text-center mb-4">
            How It Works
          </h2>
          <p className="text-body text-ash text-center mb-16 max-w-lg mx-auto">
            Three steps to interview success.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Upload Your Resume"
              description="Drop your PDF resume. Our AI extracts your skills, experience, and education — then converts it to a visual card."
            />
            <StepCard
              number="2"
              title="Get AI Analysis"
              description="We analyze your resume against your target role, identify skill gaps, and generate personalized interview questions."
            />
            <StepCard
              number="3"
              title="Practice & Improve"
              description="Take mock interviews, get scored on your answers, and chat with our AI coach to refine your responses."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-fog py-24">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 className="text-heading font-display text-ink mb-4">
            Ready to Prepare?
          </h2>
          <p className="text-body text-ash mb-8 max-w-md mx-auto">
            Start practicing with AI-powered interview preparation today.
          </p>
          <Link
            href={user ? "/dashboard" : "/auth?mode=signup"}
            className="inline-block rounded-full bg-ink text-pure-white px-8 py-3 text-body font-medium hover:opacity-90 transition-opacity"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pure-white border-t border-fog py-8">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="text-caption text-graphite">
            Built with IBM Granite AI · PrepWise AI &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-pure-white rounded-3xl shadow-card p-8">
      <div className="w-12 h-12 rounded-2xl bg-apricot-wash flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-subheading font-medium text-ink mb-2">{title}</h3>
      <p className="text-body text-ash">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-ink text-pure-white flex items-center justify-center mx-auto mb-5 text-subheading font-display">
        {number}
      </div>
      <h3 className="text-subheading font-medium text-ink mb-2">{title}</h3>
      <p className="text-body text-ash">{description}</p>
    </div>
  );
}
