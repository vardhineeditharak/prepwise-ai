"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-40 rounded-xl bg-dove/30 mx-auto mb-3 shimmer-pulse" />
          <div className="h-4 w-56 rounded-lg bg-dove/20 mx-auto shimmer-pulse" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center p-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-heading font-display text-ink">Welcome back</h1>
          <p className="text-body text-ash mt-2">
            You are already signed in.
          </p>
          <Link
            href="/"
            prefetch={true}
            className="mt-6 inline-block rounded-full bg-ink text-pure-white px-6 py-3 text-body font-medium hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <AuthForm />;
}
