"use client";

import { getSavedJobs } from "@/actions/jobs";
import { getSessionUser } from "@/actions/session";
import SiteNavbar from "@/components/site-navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

/* ────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────── */

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

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 1.5C6.4 3.2 7.2 4 8.9 4.4C7.2 4.8 6.4 5.6 6 7.3C5.6 5.6 4.8 4.8 3.1 4.4C4.8 4 5.6 3.2 6 1.5Z" fill="currentColor" />
      <path d="M12.5 8C12.8 9.3 13.4 9.9 14.7 10.2C13.4 10.5 12.8 11.1 12.5 12.5C12.2 11.1 11.6 10.5 10.3 10.2C11.6 9.9 12.2 9.3 12.5 8Z" fill="currentColor" />
      <path d="M4.5 11C4.7 11.9 5.1 12.3 6 12.5C5.1 12.7 4.7 13.1 4.5 14C4.3 13.1 3.9 12.7 3 12.5C3.9 12.3 4.3 11.9 4.5 11Z" fill="currentColor" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Mock data (Feature 10 wires real Adzuna discovery)
   ──────────────────────────────────────────────────────────── */

interface MockJob {
  id: string;
  company: string;
  role: string;
  score: number;
  salary: string;
  dateLabel: string;
  /** lower = more recently found (for date sorting) */
  dateValue: number;
}

const MATCH_BANDS = [
  "All Matches",
  "Strong Matches (80%+)",
  "Great Matches (90%+)",
  "Low Matches (<70%)",
] as const;

const SORT_OPTIONS = [
  "Date Found",
  "Oldest First",
  "Match Score",
  "High Matches First",
  "Low Matches First",
  "Company A–Z",
] as const;

const PAGE_SIZE = 6;

interface RealJob {
  id: string;
  title: string;
  company: string;
  salary: string | null;
  match_score: number;
  found_at: string;
}

function formatRelativeDate(iso: string): string {
  const hours = Math.floor((Date.now() - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function toRowShape(job: RealJob): MockJob {
  return {
    id: job.id,
    company: job.company,
    role: job.title,
    score: job.match_score,
    salary: job.salary ?? "—",
    dateLabel: formatRelativeDate(job.found_at),
    dateValue: Math.floor((Date.now() - Date.parse(job.found_at)) / 3_600_000),
  };
}

function JobLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link
      href={`/jobs/${id}`}
      className="transition-colors duration-200 hover:text-accent"
    >
      {children}
    </Link>
  );
}

function scoreColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  return "bg-warning";
}

function getPageItems(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | "…"> = [1];
  if (current > 4) items.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);
  if (current < total - 3) items.push("…");
  items.push(total);
  return items;
}

/* ────────────────────────────────────────────────────────────
   Small UI building blocks
   ──────────────────────────────────────────────────────────── */

const inputBase =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary shadow-xs placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  icon,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </span>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${icon ? "pl-9" : ""}`}
      />
    </div>
  );
}

function CompactSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface py-2 pl-3.5 pr-9 text-sm font-medium text-text-primary shadow-xs transition-all duration-200 hover:bg-surface-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:w-auto"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

function FindJobsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Search card inputs (wired to real discovery in Feature 10)
  const [jobTitle, setJobTitle] = useState("Frontend Engineer");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [summary, setSummary] = useState<{ found: number; saved: number } | null>(
    null,
  );

  // Table filters
  const [filterQuery, setFilterQuery] = useState("");
  const [matchBand, setMatchBand] = useState<string>("All Matches");
  const [sortBy, setSortBy] = useState<string>("Date Found");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    getSessionUser()
      .then(({ user, error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error || !user) {
          router.replace("/login");
          return;
        }
        const authenticatedUser = user as User;
        posthog.identify(authenticatedUser.id, {
          email: authenticatedUser.email,
          name: authenticatedUser.name,
        });

        getSavedJobs()
          .then(({ jobs: savedJobs, error }) => {
            if (cancelled) return;
            if (!error && savedJobs.length > 0) {
              setJobs(savedJobs.map((job) => toRowShape(job as RealJob)));
            }
          })
          .catch(() => {
            if (cancelled) return;
            setJobs([]);
          });
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          router.replace("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searching) return;
    setSearching(true);
    setSearchError(null);

    let response: Response;
    try {
      response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), location: location.trim() }),
      });
    } catch {
      setSearching(false);
      setSearchError("Could not reach the server. Please try again.");
      return;
    }

    const payload = await response.json().catch(() => null);
    setSearching(false);

    if (!response.ok || !Array.isArray(payload?.jobs)) {
      setSearchError(payload?.error ?? "Job search failed. Please try again.");
      return;
    }

    setJobs((payload.jobs as RealJob[]).map(toRowShape));
    setSummary({
      found: Number(payload.found) || 0,
      saved: Number(payload.saved) || 0,
    });
    setSearched(true);
    setFilterQuery("");
    setMatchBand("All Matches");
    setPage(1);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    posthog.capture("user_signed_out");
    posthog.reset();
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Proceed with redirect even if sign-out request fails
    }
    router.replace("/login");
  };

  const visibleJobs = useMemo(() => {
    const list = [...jobs];

    if (sortBy === "Match Score") {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === "High Matches First") {
      list.sort((a, b) => {
        const aHigh = a.score >= 70 ? 0 : 1;
        const bHigh = b.score >= 70 ? 0 : 1;
        return aHigh - bHigh || b.score - a.score;
      });
    } else if (sortBy === "Low Matches First") {
      list.sort((a, b) => {
        const aLow = a.score < 70 ? 0 : 1;
        const bLow = b.score < 70 ? 0 : 1;
        return aLow - bLow || b.score - a.score;
      });
    } else if (sortBy === "Oldest First") {
      list.sort((a, b) => b.dateValue - a.dateValue);
    } else if (sortBy === "Company A–Z") {
      list.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      list.sort((a, b) => a.dateValue - b.dateValue);
    }

    const query = filterQuery.trim().toLowerCase();
    return list.filter((job) => {
      const matchesQuery =
        !query ||
        job.company.toLowerCase().includes(query) ||
        job.role.toLowerCase().includes(query);
      const matchesBand =
        matchBand === "All Matches" ||
        (matchBand === "Strong Matches (80%+)" && job.score >= 80) ||
        (matchBand === "Great Matches (90%+)" && job.score >= 90) ||
        (matchBand === "Low Matches (<70%)" && job.score < 70);
      return matchesQuery && matchesBand;
    });
  }, [jobs, filterQuery, matchBand, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedJobs = visibleJobs.slice(startIndex, startIndex + PAGE_SIZE);
  const endIndex = Math.min(startIndex + PAGE_SIZE, visibleJobs.length);

  const handleBandChange = (value: string) => {
    setMatchBand(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <span className="flex h-10 w-10 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </span>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* ─── Navbar ─── */}
      <SiteNavbar
        active="find-jobs"
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      {/* ─── Find Jobs content ─── */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:px-8">
        <div className="space-y-6">
          {/* ─── Search card ─── */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <form
              onSubmit={handleSearch}
              className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
            >
              <Field label="Job Title" htmlFor="jobTitle">
                <TextInput
                  id="jobTitle"
                  value={jobTitle}
                  onChange={setJobTitle}
                  icon={<SearchIcon />}
                />
              </Field>
              <Field label="Location" htmlFor="location">
                <TextInput
                  id="location"
                  value={location}
                  onChange={setLocation}
                  placeholder="Remote, New York..."
                />
              </Field>
              <button
                type="submit"
                disabled={searching}
                className="flex h-[42px] items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1"
              >
                {searching ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                ) : (
                  <SearchIcon />
                )}
                {searching ? "Searching…" : "Find Jobs"}
              </button>
            </form>

            {searchError && (
              <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {searchError}
              </p>
            )}

            {/* Found summary banner */}
            {summary && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-success-lightest px-4 py-3">
                <SparklesIcon className="h-4 w-4 shrink-0 text-success" />
                <p className="text-sm font-medium text-success-foreground">
                  Found {summary.found} jobs — {summary.saved} strong matches.
                </p>
              </div>
            )}
          </section>

          {/* ─── Filter + sort bar ─── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={filterQuery}
                onChange={(e) => {
                  setFilterQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by company or role..."
                aria-label="Filter by company or role"
                className={`${inputBase} pl-9 [&::-webkit-search-cancel-button]:hidden`}
              />
            </div>
            <div className="flex items-center gap-2">
              <CompactSelect
                value={matchBand}
                onChange={handleBandChange}
                options={MATCH_BANDS}
                ariaLabel="Filter by match score"
              />
              <CompactSelect
                value={sortBy}
                onChange={handleSortChange}
                options={SORT_OPTIONS}
                ariaLabel="Sort results"
              />
            </div>
          </div>

          {/* ─── Results table ─── */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary/50">
                    {["Company", "Role", "Match Score", "Salary Est.", "Date Found"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pagedJobs.length > 0 ? (
                    pagedJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-border transition-colors duration-150 last:border-0 hover:bg-surface-secondary/60"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary text-sm font-bold text-text-primary"
                              aria-hidden="true"
                            >
                              {job.company.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-text-primary">
                              <JobLink id={job.id}>
                                {job.company}
                              </JobLink>
                            </span>
                          </div>
                        </th>
                        <td className="px-6 py-4 text-sm font-medium text-text-primary">
                          <JobLink id={job.id}>
                            {job.role}
                          </JobLink>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-1.5 w-16 overflow-hidden rounded-full bg-border"
                              role="progressbar"
                              aria-valuenow={job.score}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${job.score}% match score`}
                            >
                              <div
                                className={`h-full rounded-full ${scoreColor(job.score)} transition-all duration-500`}
                                style={{ width: `${job.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-text-primary">
                              {job.score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm tabular-nums text-text-secondary">
                          {job.salary}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">
                          {job.dateLabel}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center">
                        <p className="text-sm font-medium text-text-primary">
                          {searched && summary?.found === 0
                            ? "No jobs found for this search"
                            : searched && jobs.length === 0
                              ? "No matches for this search"
                              : jobs.length === 0
                                ? "No saved jobs yet"
                                : "No jobs match your filters"}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          {searched && summary?.found === 0
                            ? "Try a different job title or location."
                            : searched && jobs.length === 0
                              ? "Try a different job title or location."
                              : jobs.length === 0
                                ? "Run a search above to find and save your matches."
                                : "Try clearing the match filter or adjusting the search."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer + pagination */}
            <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-muted">
                Showing {visibleJobs.length === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
                {visibleJobs.length} results
              </p>
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {getPageItems(currentPage, totalPages).map((item, index) =>
                    item === "…" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1.5 text-sm text-text-muted"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                        className={`h-8 min-w-8 rounded-lg px-2.5 text-sm font-medium transition-all duration-200 ${
                          item === currentPage
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function FindJobsPage() {
  return <FindJobsContent />;
}
