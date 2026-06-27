"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isLanding = pathname === "/";
  const isAuth = pathname.startsWith("/auth");

  if (isAuth) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/resume-analysis", label: "Resume Analysis" },
        { href: "/practice", label: "Practice" },
        { href: "/coach", label: "AI Coach" },
      ]
    : [];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isLanding
          ? "bg-pure-white/60 backdrop-blur-md border-transparent"
          : "bg-pure-white/80 backdrop-blur-md border-fog"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          prefetch={true}
          className="text-body-lg font-display font-medium text-ink tracking-tight"
        >
          PrepWise
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`text-caption transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-ink font-medium"
                  : "text-ash hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="w-px h-4 bg-dove" />
              <span className="text-caption text-graphite truncate max-w-[120px]">
                {profile?.name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-caption text-rust hover:underline shrink-0"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" prefetch={true} className="text-caption text-ash hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                prefetch={true}
                className="rounded-full bg-ink text-pure-white px-5 py-2 text-caption font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          mobileOpen ? "animate-slide-down" : "max-h-0"
        }`}
      >
        <div className="border-t border-fog bg-pure-white px-4 md:px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`block text-body ${
                pathname === link.href ? "text-ink font-medium" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <hr className="border-fog" />
              <span className="block text-caption text-graphite">{profile?.name || user.email}</span>
              <button onClick={handleSignOut} className="block text-body text-rust">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" prefetch={true} className="block text-body text-ink">Sign in</Link>
              <Link href="/auth?mode=signup" prefetch={true} className="block text-body text-rust font-medium">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
