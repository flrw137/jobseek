"use client";

import { initiateOAuth } from "@/actions/auth";
import Link from "next/link";
import posthog from "posthog-js";
import { useFormStatus } from "react-dom";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

function OAuthButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all duration-200 hover:bg-surface-secondary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span className="flex h-5 w-5 items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
        </span>
      ) : (
        children
      )}
      {label}
    </button>
  );
}

export default function LoginPage() {
  const handleOAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    posthog.capture("oauth_sign_in_started", {
      provider: formData.get("provider"),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8">
          <Link href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm">
              J
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-text-primary">
              Jobseek
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="col-start-3 flex items-center justify-end">
            <Link
              href="/login"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
            >
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Main content — 2 columns ─── */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-8">
          {/* ─── Left column: Title & Description ─── */}
          <div className="flex flex-col justify-center lg:pr-4">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-sm font-medium text-accent">
              <span className="flex h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              AI-powered job search
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
              Ready to find your
              <br />
              <span className="text-accent">next role?</span>
            </h1>
            <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">
              Join thousands of developers who use Jobseek to discover
              tailored opportunities, research companies, and apply with
              confidence.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="8" fill="currentColor" className="text-success-light" />
                  <path
                    d="M5 8L7 10L11 6"
                    stroke="currentColor"
                    className="text-success"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-text-secondary">Smart matching</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="8" fill="currentColor" className="text-success-light" />
                  <path
                    d="M5 8L7 10L11 6"
                    stroke="currentColor"
                    className="text-success"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-text-secondary">Company research</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="8" fill="currentColor" className="text-success-light" />
                  <path
                    d="M5 8L7 10L11 6"
                    stroke="currentColor"
                    className="text-success"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-text-secondary">Application tracking</span>
              </div>
            </div>
          </div>

          {/* ─── Right column: Sign-in card ─── */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
              {/* Card header */}
              <div className="mb-8 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-light text-sm font-bold text-accent">
                    J
                  </div>
                </div>
                <h2 className="mb-1 text-xl font-bold tracking-tight text-text-primary">
                  Sign in to Jobseek
                </h2>
                <p className="text-sm text-text-secondary">
                  Choose your preferred sign-in method
                </p>
              </div>

              {/* OAuth buttons */}
              <div className="space-y-3">
                <form action={initiateOAuth} onSubmit={handleOAuthSubmit}>
                  <input type="hidden" name="provider" value="google" />
                  <OAuthButton label="Continue with Google">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </OAuthButton>
                </form>

                <form action={initiateOAuth} onSubmit={handleOAuthSubmit}>
                  <input type="hidden" name="provider" value="github" />
                  <OAuthButton label="Continue with GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </OAuthButton>
                </form>
              </div>

              {/* Divider + Terms */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-text-muted">OR</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
                By continuing, you agree to Jobseek&apos;s{" "}
                <a href="#" className="text-accent underline underline-offset-2 transition-colors hover:text-accent-dark">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-accent underline underline-offset-2 transition-colors hover:text-accent-dark">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
