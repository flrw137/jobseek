"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileNav from "@/components/mobile-nav";
import { useState } from "react";

interface NavUser {
  id: string;
  email?: string;
  name?: string;
}

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function NavAuth({ user }: { user: NavUser | null }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Proceed with redirect even if sign-out request fails
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8">
        {/* Left — logo */}
        <Link href="/" className="flex w-fit items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm">
            J
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-text-primary">
            Jobseek
          </span>
        </Link>

        {/* Center — nav links (logged in) */}
        <div className="hidden items-center gap-8 md:flex">
          {user &&
            navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
        </div>

        {/* Right — actions */}
        <div className="col-start-3 flex items-center justify-end gap-8">
          {!user ? (
            <Link
              href="/login"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
            >
              Start for free
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="hidden rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition-all duration-200 hover:bg-surface-secondary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 md:block"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
              <div className="md:hidden">
                <MobileNav
                  active="dashboard"
                  onSignOut={handleSignOut}
                  signingOut={signingOut}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
