"use client";

import Link from "next/link";
import MobileNav, { type MobileNavActive } from "@/components/mobile-nav";

/* ────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────── */

function DashboardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 13.5C3.5 10.5 5.5 9.5 8 9.5C10.5 9.5 12.5 10.5 13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.6667 11.3333L14 8L10.6667 4.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Shared app navbar — logo left, nav links centered, actions right
   ──────────────────────────────────────────────────────────── */

interface NavItem {
  key: MobileNavActive;
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "find-jobs", href: "/find-jobs", label: "Find Jobs", Icon: SearchIcon },
  { key: "profile", href: "/profile", label: "Profile", Icon: UserIcon },
];

export default function SiteNavbar({
  active,
  onSignOut,
  signingOut = false,
  showFindJobsNotification = false,
}: {
  active: MobileNavActive;
  onSignOut: () => void;
  signingOut?: boolean;
  showFindJobsNotification?: boolean;
}) {
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

        {/* Center — nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map(({ key, href, label, Icon }) => {
            const isActive = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="relative">
                  <Icon />
                  {key === "find-jobs" && showFindJobsNotification && (
                    <span
                      className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  )}
                </span>
                {label}
                {isActive && (
                  <span
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — actions */}
        <div className="col-start-3 flex items-center justify-end gap-8">
          <button
            onClick={onSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            title="Sign out"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 md:flex"
          >
            {signingOut ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
            ) : (
              <LogoutIcon />
            )}
          </button>
          <MobileNav
            active={active}
            onSignOut={onSignOut}
            signingOut={signingOut}
          />
        </div>
      </div>
    </nav>
  );
}
