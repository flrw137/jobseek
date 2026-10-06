"use client";

import { getJob, type JobDetail } from "@/actions/jobs";
import type { ResearchDossier } from "@/agent/types";
import { getSessionUser } from "@/actions/session";
import SiteNavbar from "@/components/site-navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

/* ────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────── */

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2.5 8L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13.5L2.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 3H13V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 9.5V12.5C11 12.8978 10.842 13.2794 10.5607 13.5607C10.2794 13.842 9.89782 14 9.5 14H3.5C3.10218 14 2.72064 13.842 2.43934 13.5607C2.15804 13.2794 2 12.8978 2 12.5V6.5C2 6.10218 2.15804 5.72064 2.43934 5.43934C2.72064 5.15804 3.10218 5 3.5 5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M13 11L13.8 13.2L16 14L13.8 14.8L13 17L12.2 14.8L10 14L12.2 13.2L13 11Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function BanknoteIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6.5H5.01M11 9.5H11.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 15C8 15 13 10.5 13 6.5C13 3.5 10.5 1.5 8 1.5C5.5 1.5 3 3.5 3 6.5C3 10.5 8 15 8 15Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="4.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 4.5V3.5C6 3.10218 6.15804 2.72064 6.43934 2.43934C6.72064 2.15804 7.10218 2 7.5 2H8.5C8.89782 2 9.27936 2.15804 9.56066 2.43934C9.84196 2.72064 10 3.10218 10 3.5V4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1.5V4.5M11 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

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

const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
};

function jobTypeLabel(value: string | null): string {
  if (!value) return "—";
  return JOB_TYPE_LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

function scoreBarClasses(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-error";
}

/* ────────────────────────────────────────────────────────────
   Small building blocks
   ──────────────────────────────────────────────────────────── */

function InfoCard({
  icon,
  label,
  value,
  iconClassName,
  iconBgClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClassName?: string;
  iconBgClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-3 shadow-xs">
      <div className="grid grid-cols-[28px_1fr] items-center gap-2.5 text-text-muted">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBgClassName ?? "bg-surface"}`}
        >
          <span className={iconClassName ?? "text-text-muted"}>{icon}</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</span>
      </div>
      <p className="mt-2 pl-9 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-primary">
        {icon && <span className="text-text-muted">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DossierText({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{value}</p>
    </div>
  );
}

function DossierList({
  label,
  items,
  highlight = false,
}: {
  label: string;
  items: string[];
  highlight?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3
        className={`text-xs font-semibold uppercase tracking-wider ${highlight ? "text-accent" : "text-text-secondary"}`}
      >
        {label}
      </h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
        {items.map((item, index) => (
          <li key={`${label}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function CompanyResearchDossier({ dossier }: { dossier: ResearchDossier }) {
  return (
    <div className="mt-5 space-y-6">
      <DossierText label="Company Overview" value={dossier.companyOverview} />

      {dossier.techStack.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tech Stack</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dossier.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-medium text-text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <DossierText label="Why This Role" value={dossier.whyThisRole} />
      <DossierList label="Your Edge" items={dossier.yourEdge} highlight />
      <DossierList label="Gaps to Address" items={dossier.gapsToAddress} />
      <DossierList label="Smart Questions" items={dossier.smartQuestions} />
      <DossierList label="Culture" items={dossier.culture} />
      <DossierList label="Interview Prep" items={dossier.interviewPrep} />

      {dossier.sources.some(isHttpUrl) && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sources</h3>
          <div className="mt-2 flex flex-col gap-1.5">
            {dossier.sources.filter(isHttpUrl).map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs break-all text-accent underline underline-offset-2 transition-colors hover:text-accent-dark"
              >
                {url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

function JobDetailsContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSessionUser()
      .then(({ user, error: sessionError }) => {
        if (cancelled) return;
        if (sessionError || !user) {
          router.replace("/login");
          return;
        }
        posthog.identify((user as User).id, {
          email: (user as User).email,
          name: (user as User).name,
        });

        getJob(jobId)
          .then(({ job: savedJob, error: jobError }) => {
            if (cancelled) return;
            setLoading(false);
            if (jobError || !savedJob) {
              setError(jobError ?? "Job not found.");
              return;
            }
            setJob(savedJob);
          })
          .catch(() => {
            if (!cancelled) {
              setLoading(false);
              setError("Could not load this job. Please try again.");
            }
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
  }, [router, jobId]);

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

  const handleResearch = async () => {
    if (!job) return;
    setResearching(true);
    setResearchError(null);
    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResearchError(data.error ?? "Company research failed. Please try again.");
        return;
      }
      setJob((current) =>
        current ? { ...current, company_research: data.dossier as ResearchDossier } : current,
      );    } catch {
      setResearchError("Could not reach the research service. Please try again.");
    } finally {
      setResearching(false);
    }
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

  const applyUrl = job?.external_apply_url ?? job?.source_url ?? "";

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* ─── Navbar ─── */}
      <SiteNavbar
        active="find-jobs"
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      {/* ─── Job details content ─── */}
      <div className="mx-auto w-full max-w-[62rem] flex-1 px-6 py-8 lg:px-8">
        {error || !job ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-text-primary">{error ?? "Job not found."}</p>
            <Link
              href="/find-jobs"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
            >
              <ArrowLeftIcon />
              Back to Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back to Jobs */}
            <Link
              href="/find-jobs"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Jobs
            </Link>

            {/* ─── Job header ─── */}
            <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-text-muted ring-1 ring-inset ring-border"
                    aria-hidden="true"
                  >
                    <BriefcaseIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-text-primary sm:text-[1.2rem]">
                        {job.title ?? "Untitled job"}
                      </h1>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                          job.match_score === null
                            ? "bg-surface-secondary text-text-secondary"
                            : job.match_score >= 80
                              ? "bg-success-light text-success-foreground"
                              : job.match_score >= 50
                                ? "bg-warning text-warning-foreground"
                                : "bg-error text-error-foreground"
                        }`}
                      >
                        {job.match_score !== null ? `${job.match_score}%` : "No score"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {job.company ?? "Unknown company"}
                    </p>
                  </div>
                </div>

                {applyUrl && (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:shadow-sm"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    View Job Post
                  </a>
                )}
              </div>
            </section>

            {/* ─── Info cards ─── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                icon={<BanknoteIcon className="h-5 w-5" />}
                label="Salary Est."
                value={job.salary ?? "—"}
                iconClassName="text-error"
                iconBgClassName="bg-red-50"
              />
              <InfoCard
                icon={<MapPinIcon className="h-5 w-5" />}
                label="Location"
                value={job.location ?? "Not specified"}
                iconClassName="text-info"
                iconBgClassName="bg-blue-50"
              />
              <InfoCard
                icon={<BriefcaseIcon className="h-5 w-5" />}
                label="Job Type"
                value={jobTypeLabel(job.job_type)}
                iconClassName="text-success"
                iconBgClassName="bg-emerald-50"
              />
              <InfoCard
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Date Found"
                value={formatRelativeDate(job.found_at)}
                iconClassName="text-warning"
                iconBgClassName="bg-amber-50"
              />
            </div>

            {/* ─── AI Match Reasoning ─── */}
            <SectionCard icon={<SparklesIcon className="h-4 w-4" />} title="AI Match Reasoning">
              <div className="flex items-start gap-3">
                {job.match_score !== null && (
                  <div className="hidden shrink-0 pt-0.5 sm:block">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-border" role="presentation">
                      <div
                        className={`h-full rounded-full ${scoreBarClasses(job.match_score)}`}
                        style={{ width: `${job.match_score}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm leading-relaxed text-text-secondary">
                  {job.match_reason ??
                    "No match reasoning available for this job yet."}
                </p>
              </div>
            </SectionCard>

            {/* ─── Required Skills vs Your Profile ─── */}
            <SectionCard icon={<CheckIcon className="h-4 w-4" />} title="Required Skills vs Your Profile">
              {job.matched_skills.length === 0 && job.missing_skills.length === 0 ? (
                <p className="text-sm text-text-muted">No skill comparison available for this job yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-success">
                      Matched Skills
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.matched_skills.length > 0 ? (
                        job.matched_skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground"
                          >
                            <CheckIcon />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-text-muted">None detected.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Missing Skills
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.missing_skills.length > 0 ? (
                        job.missing_skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold text-accent"
                          >
                            <CrossIcon />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-text-muted">You cover all listed skills.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ─── Job Description ─── */}
            <SectionCard icon={<BriefcaseIcon className="h-4 w-4" />} title="Job Description">
              {job.about_role ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                  {job.about_role}
                </p>
              ) : (
                <p className="text-sm text-text-muted">No description available for this job.</p>
              )}

              <BulletList title="Responsibilities" items={job.responsibilities} />
              <BulletList title="Requirements" items={job.requirements} />
              <BulletList title="Nice to Have" items={job.nice_to_have} />
              <BulletList title="Benefits" items={job.benefits} />

              {job.about_company && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-text-primary">About the Company</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {job.about_company}
                  </p>
                </div>
              )}
            </SectionCard>

            {/* ─── Company Research ─── */}
            <section
              className={`rounded-xl border bg-surface p-4 shadow-sm sm:p-5 ${
                job.company_research ? "border-border" : "border-dashed border-border"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-primary">
                  Company Research
                </h2>

                {!job.company_research && (
                  <button
                    type="button"
                    onClick={handleResearch}
                    disabled={researching}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {researching ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                    ) : (
                      <SparklesIcon className="h-4 w-4" />
                    )}
                    {researching ? "Researching…" : "Research Company"}
                  </button>
                )}
              </div>

              {job.company_research ? (
                <CompanyResearchDossier dossier={job.company_research} />
              ) : (
                <div className="mt-4 rounded-xl border border-border bg-surface-secondary px-5 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-accent">
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-text-primary">No research yet</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Click “Research Company” to let AI browse the company and build a dossier.
                  </p>
                </div>
              )}

              {researchError && (
                <p className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                  {researchError}
                </p>
              )}
            </section>

            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Apply Now{job.company ? ` at ${job.company}` : ""}
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function JobDetailsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? null;

  if (!jobId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <span className="flex h-10 w-10 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </span>
      </main>
    );
  }

  return <JobDetailsContent jobId={jobId} />;
}
