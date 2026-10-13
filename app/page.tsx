import Link from "next/link";

import { NavAuth } from "@/components/nav-auth";
import { createInsforgeServer } from "@/lib/insforge-server";

const jobListings = [
  {
    company: "Vercel",
    logo: "V",
    role: "Senior Frontend Engineer",
    location: "Remote",
    salary: "$180k+",
    match: 94,
    skills: ["React", "TypeScript", "Next.js"],
    badge: "Tailored",
  },
  {
    company: "Stripe",
    logo: "S",
    role: "Full Stack Engineer",
    location: "Remote • US",
    salary: "$200k+",
    match: 88,
    skills: ["TypeScript", "Node.js", "React", "PostgreSQL"],
    badge: "Strong Match",
  },
  {
    company: "Linear",
    logo: "L",
    role: "Product Engineer",
    location: "Remote",
    salary: "$160k+",
    match: 82,
    skills: ["React", "TypeScript", "GraphQL"],
    badge: "Strong Match",
  },
];

const manageFeatures = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M17.5 9.58332V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H10.4167"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.3333 1.66666H18.3333V6.66666"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.1665 10.8333L18.3332 1.66666"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Find relevant jobs — fast",
    description:
      "Jobseek scans thousands of listings across the web and surfaces roles that match your specific skills, experience, and preferences.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.66666V10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 13.3333H10.0083"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Understand the company",
    description:
      "Get a full dossier on every company — their tech stack, culture, funding, and what to expect before you ever apply.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 1.66666L12.575 6.88333L18.3333 7.725L14.1667 11.7833L15.15 17.5167L10 14.85L4.85 17.5167L5.83333 11.7833L1.66667 7.725L7.425 6.88333L10 1.66666Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Track every application",
    description:
      "Keep a clear picture of where you've applied, what stage you're at, and what's working — all in one place.",
  },
];

const confidenceFeatures = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Match scores you can trust",
    description:
      "Every role is scored 0-100 based on how your actual experience aligns with what the job requires — not just keywords.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 12L11 15L16 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "AI-powered matching",
    description:
      "GPT-4o analyzes each job description against your profile to find the strongest opportunities.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 6V12L16 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Focused on what matters",
    description:
      "Stop scrolling through endless job boards. Get a curated list of roles that are actually worth your time.",
  },
];

export default async function Home() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <NavAuth user={user} />

      <section className="relative overflow-hidden border-b border-border bg-surface py-20 sm:py-24 lg:py-28">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent-muted blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-48 -right-32 h-[400px] w-[400px] rounded-full bg-success-lightest blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-32 h-[360px] w-[360px] rounded-full bg-info-lightest blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-sm font-medium text-accent shadow-xs">
              <span
                className="flex h-2 w-2 rounded-full bg-accent"
                aria-hidden="true"
              />
              AI-powered job search, built for developers
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Job hunting is hard.
              <br />
              <span className="text-accent">Your tools shouldn&apos;t be.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
              Jobseek does the heavy lifting—finding the right opportunities,
              researching companies, and preparing you to put your best foot
              forward.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/find-jobs"
                    className="rounded-lg bg-accent-light px-6 py-3 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent-light/80"
                  >
                    Find Your First Match
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md"
                  >
                    Get Started
                  </a>
                  <a
                    href="/login"
                    className="rounded-lg bg-accent-light px-6 py-3 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent-light/80"
                  >
                    Find Your First Match
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-2xl">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[32px] bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-60 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative rounded-[24px] border border-border bg-surface p-4 shadow-[0_24px_64px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Your next opportunity
                  </p>
                  <p className="text-xs text-text-muted">
                    Curated for your profile
                  </p>
                </div>
                <div className="rounded-full bg-success-lightest px-3 py-1 text-sm font-semibold text-success-foreground">
                  94% match
                </div>
              </div>

              <div className="space-y-4">
                {jobListings.map((job) => (
                  <div
                    key={job.company}
                    className="group rounded-xl border border-border bg-surface-secondary p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-text-primary"
                          aria-hidden="true"
                        >
                          {job.logo}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {job.role}
                          </p>
                          <p className="text-sm text-text-muted">
                            {job.company} • {job.location} • {job.salary}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          job.badge === "Tailored"
                            ? "bg-accent-light text-accent"
                            : "bg-success-lightest text-success-foreground"
                        }`}
                      >
                        {job.badge}
                      </span>
                    </div>
                    <div
                      className="mb-2.5 h-1.5 rounded-full bg-border"
                      role="progressbar"
                      aria-valuenow={job.match}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${job.match}% match score`}
                    >
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${job.match}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Manage your job search
            </h2>
            <p className="text-lg leading-relaxed text-text-secondary">
              From discovery to application, Jobseek keeps everything organized
              so you can focus on putting your best foot forward.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              {manageFeatures.map((feature) => (
                <div key={feature.title} className="group flex gap-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent shadow-sm transition-all duration-200 group-hover:border-accent/30 group-hover:shadow-md">
                    {feature.icon}
                  </div>
                  <div className="pt-1">
                    <h3 className="mb-1.5 text-base font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <p className="text-sm font-semibold text-text-primary">
                  Recent matches
                </p>
                <span className="text-xs text-text-muted">View all →</span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    company: "Vercel",
                    logo: "V",
                    role: "Senior Frontend Engineer",
                    score: 94,
                  },
                  {
                    company: "Stripe",
                    logo: "S",
                    role: "Full Stack Engineer",
                    score: 88,
                  },
                  {
                    company: "Notion",
                    logo: "N",
                    role: "Product Engineer",
                    score: 76,
                  },
                  {
                    company: "Linear",
                    logo: "L",
                    role: "Design Engineer",
                    score: 71,
                  },
                ].map((item) => (
                  <div
                    key={item.company}
                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-surface-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-xs font-bold text-text-primary"
                        aria-hidden="true"
                      >
                        {item.logo}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {item.role}
                        </p>
                        <p className="text-xs text-text-muted">
                          {item.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-16 rounded-full bg-border"
                        role="progressbar"
                        aria-valuenow={item.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.score}% match score`}
                      >
                        <div
                          className="h-1.5 rounded-full bg-accent"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-text-secondary">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Apply with more confidence
            </h2>
            <p className="text-lg leading-relaxed text-text-secondary">
              Know exactly where you stand before you hit submit. Jobseek gives
              you the insight you need to tailor each application.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-last lg:order-first">
              <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="flex h-2 w-2 rounded-full bg-success"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-text-muted">
                    agent_log — matching complete
                  </span>
                </div>
                <div
                  className="space-y-3 font-mono text-xs leading-relaxed"
                  role="log"
                  aria-label="AI agent matching log output"
                >
                  <p className="text-text-muted">
                    <span className="text-accent" aria-hidden="true">
                      $
                    </span>
                    jobpilot match --profile &quot;senior-frontend&quot; --job
                    &quot;product-engineer&quot;
                  </p>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p>
                      <span className="text-success" aria-hidden="true">
                        ✓
                      </span>{" "}
                      <span className="text-text-primary">
                        Profile loaded — Senior Frontend Engineer, 8 years exp
                      </span>
                    </p>
                    <p>
                      <span className="text-success" aria-hidden="true">
                        ✓
                      </span>{" "}
                      <span className="text-text-primary">
                        Job analyzed — Product Engineer at Vercel
                      </span>
                    </p>
                    <p>
                      <span className="text-success" aria-hidden="true">
                        ✓
                      </span>{" "}
                      <span className="text-text-primary">
                        Skills matched: React, TypeScript, Next.js, System Design
                      </span>
                    </p>
                    <p>
                      <span className="text-warning" aria-hidden="true">
                        △
                      </span>{" "}
                      <span className="text-text-primary">
                        Gap detected: GraphQL — adjacent experience in REST API
                        design
                      </span>
                    </p>
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="text-accent">── Match Score: 94% ──</p>
                      <p className="mt-1 text-text-muted">
                        Strong alignment. Focus talking points on scalability and
                        Next.js expertise.
                      </p>
                    </div>
                  </div>
                  <p className="text-text-muted">
                    <span className="text-accent" aria-hidden="true">
                      $
                    </span>{" "}
                    _
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {confidenceFeatures.map((feature) => (
                <div key={feature.title} className="group flex gap-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-accent shadow-sm transition-all duration-200 group-hover:border-accent/30 group-hover:shadow-md">
                    {feature.icon}
                  </div>
                  <div className="pt-1">
                    <h3 className="mb-1.5 text-base font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mb-2 flex justify-center gap-1 text-xl text-warning"
              aria-label="5 out of 5 stars"
              role="img"
            >
              <span aria-hidden="true">★</span>
              <span aria-hidden="true">★</span>
              <span aria-hidden="true">★</span>
              <span aria-hidden="true">★</span>
              <span aria-hidden="true">★</span>
            </div>
            <blockquote className="mb-8 text-2xl font-medium leading-relaxed tracking-tight text-text-primary sm:text-3xl">
              &ldquo;Jobseek transformed my job search. Instead of spending hours
              researching companies and wondering if I was a good fit, I had
              everything I needed to apply with confidence. I found my dream role
              in two weeks.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent"
                aria-hidden="true"
              >
                TW
              </div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Tom Wilson</p>
                <p className="text-sm text-text-muted">
                  Junior Developer at Linear
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Your next job search can feel a lot less overwhelming.
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-text-secondary">
            Join thousands of developers who&apos;ve taken control of their
            search with Jobseek.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="rounded-lg bg-text-primary px-8 py-4 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/find-jobs"
                  className="rounded-lg bg-accent-light px-8 py-4 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent-light/80"
                >
                  Find Your First Match
                </a>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-lg bg-text-primary px-8 py-4 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md"
                >
                  Get Started
                </a>
                <a
                  href="/login"
                  className="rounded-lg bg-accent-light px-8 py-4 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent-light/80"
                >
                  Find Your First Match
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent text-xs font-bold text-accent-foreground shadow-sm">
              J
            </div>
            <span className="text-sm font-semibold text-text-primary">
              Jobseek
            </span>
          </Link>
          <div className="flex flex-wrap gap-8">
            <Link
              href="/dashboard"
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Dashboard
            </Link>
            <a
              href="#"
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
