"use client";

import { getSessionUser } from "@/actions/session";
import { getDashboardStats, type DashboardStats } from "@/actions/jobs";
import SiteNavbar from "@/components/site-navbar";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

/* ────────────────────────────────────────────────────────────
   Mock data (Feature 16/17 wire real data)
   ──────────────────────────────────────────────────────────── */

interface Activity {
  title: string;
  time: string;
  dotOuter: string;
  dotInner: string;
}

const ACTIVITIES: Activity[] = [
  {
    title: "Found 8 jobs for Frontend Engineer",
    time: "10 mins ago",
    dotOuter: "bg-accent-light",
    dotInner: "bg-accent",
  },
  {
    title: "Researched Stripe",
    time: "1 hour ago",
    dotOuter: "bg-info-light",
    dotInner: "bg-info",
  },
  {
    title: "Found 12 jobs for React Developer",
    time: "2 hours ago",
    dotOuter: "bg-success-light",
    dotInner: "bg-success-alt",
  },
  {
    title: "Researched Vercel",
    time: "Yesterday",
    dotOuter: "bg-accent-light",
    dotInner: "bg-accent",
  },
  {
    title: "Found 10 jobs for Full Stack Engineer",
    time: "Yesterday",
    dotOuter: "bg-success-light",
    dotInner: "bg-success-alt",
  },
];

const RESEARCH_ACTIVITY = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 8 },
  { label: "Fri", value: 12 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 1 },
];

const JOBS_OVER_TIME = [
  { label: "Mon", value: 20 },
  { label: "Tue", value: 45 },
  { label: "Wed", value: 60 },
  { label: "Thu", value: 72 },
  { label: "Fri", value: 82 },
  { label: "Sat", value: 55 },
  { label: "Sun", value: 30 },
];

const SCORE_DISTRIBUTION = [
  { label: "50-60%", value: 5 },
  { label: "60-70%", value: 12 },
  { label: "70-80%", value: 45 },
  { label: "80-90%", value: 80 },
  { label: "90-100%", value: 40 },
];

/* ────────────────────────────────────────────────────────────
   Chart building blocks (inline SVG — recharts arrives in 17)
   ──────────────────────────────────────────────────────────── */

function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q ${x0},${y0} ${mx},${my}`;
  }
  d += ` L ${points[points.length - 1][0]},${points[points.length - 1][1]}`;
  return d;
}

const CHART_W = 560;
const CHART_H = 220;
const PAD_L = 40;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 30;

function ChartGrid({
  yTicks,
  max,
}: {
  yTicks: number[];
  max: number;
}) {
  const plotH = CHART_H - PAD_T - PAD_B;
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;
  return (
    <>
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD_L}
            x2={CHART_W - PAD_R}
            y1={y(tick)}
            y2={y(tick)}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={PAD_L - 8}
            y={y(tick) + 4}
            textAnchor="end"
            className="fill-text-muted"
            fontSize="11"
          >
            {tick}
          </text>
        </g>
      ))}
    </>
  );
}

function BarChart({
  data,
  yTicks,
  max,
  barClass,
  ariaLabel,
}: {
  data: { label: string; value: number }[];
  yTicks: number[];
  max: number;
  barClass: string;
  ariaLabel: string;
}) {
  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;
  const slot = plotW / data.length;
  const barW = Math.min(slot * 0.5, 36);
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <ChartGrid yTicks={yTicks} max={max} />
      {data.map((d, i) => {
        const x = PAD_L + slot * i + (slot - barW) / 2;
        const h = (d.value / max) * plotH;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y(d.value)}
              width={barW}
              height={Math.max(h, 2)}
              rx={3}
              className={`${barClass} transition-opacity duration-150 hover:opacity-75`}
            />
            <text
              x={PAD_L + slot * i + slot / 2}
              y={CHART_H - PAD_B / 2 + 4}
              textAnchor="middle"
              className="fill-text-muted"
              fontSize="11"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AreaLineChart({
  data,
  yTicks,
  max,
  ariaLabel,
}: {
  data: { label: string; value: number }[];
  yTicks: number[];
  max: number;
  ariaLabel: string;
}) {
  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;
  const x = (i: number) => PAD_L + (i / (data.length - 1)) * plotW;
  const points = data.map((d, i) => [x(i), y(d.value)] as [number, number]);
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1][0]},${PAD_T + plotH} L ${points[0][0]},${PAD_T + plotH} Z`;
  const gradientId = "jobsOverTimeGradient";

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ChartGrid yTicks={yTicks} max={max} />
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        className="stroke-accent"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <text
          key={d.label}
          x={x(i)}
          y={CHART_H - PAD_B / 2 + 4}
          textAnchor="middle"
          className="fill-text-muted"
          fontSize="11"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Card shell
   ──────────────────────────────────────────────────────────── */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    getSessionUser()
      .then(async ({ user, error }) => {
        if (error || !user) {
          setLoading(false);
          router.replace("/login");
          return;
        }
        const authenticatedUser = user as User;
        posthog.identify(authenticatedUser.id, {
          email: authenticatedUser.email,
          name: authenticatedUser.name,
        });
        const { stats: loadedStats, error: statsErrorResult } = await getDashboardStats();
        setStats(loadedStats);
        setStatsError(Boolean(statsErrorResult));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.replace("/login");
      });
  }, [router]);

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
        active="dashboard"
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      {/* ─── Dashboard content ─── */}
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-10 lg:px-8">
        {/* Row 1 — stat cards (Feature 15 real data) */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-medium text-text-secondary">Total Jobs Found</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              {stats?.totalJobsFound ?? "—"}
            </p>
            {statsError ? (
              <p className="mt-2.5 text-xs text-text-muted">Could not load stats</p>
            ) : stats && stats.totalJobsTrend !== null ? (
              <span
                className={`mt-2.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  stats.totalJobsTrend >= 0
                    ? "bg-success-lightest text-success-darker"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {stats.totalJobsTrend >= 0 ? "+" : ""}
                {stats.totalJobsTrend}% vs last week
              </span>
            ) : (
              <p className="mt-2.5 text-xs text-text-muted">Total saved jobs</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-medium text-text-secondary">Avg. Match Rate</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              {stats?.avgMatchRate !== null && stats?.avgMatchRate !== undefined
                ? `${stats.avgMatchRate}%`
                : "—"}
            </p>
            {statsError ? (
              <p className="mt-2.5 text-xs text-text-muted">Could not load stats</p>
            ) : stats && stats.avgMatchRateTrend !== null ? (
              <span
                className={`mt-2.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  stats.avgMatchRateTrend >= 0
                    ? "bg-success-lightest text-success-darker"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {stats.avgMatchRateTrend >= 0 ? "+" : ""}
                {stats.avgMatchRateTrend} pts vs last week
              </span>
            ) : (
              <p className="mt-2.5 text-xs text-text-muted">Across all saved jobs</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-medium text-text-secondary">Companies Researched</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              {stats?.companiesResearched ?? "—"}
            </p>
            <p className="mt-2.5 text-xs text-text-muted">Total researched</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-medium text-text-secondary">Jobs This Week</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              {stats?.jobsThisWeek ?? "—"}
            </p>
            <p className="mt-2.5 text-xs text-text-muted">New this week</p>
          </div>
        </div>

        {/* Row 2 — activity + research bar chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Recent Activity">
            <ul>
              {ACTIVITIES.map((item, index) => (
                <li
                  key={item.title}
                  className="relative flex gap-3.5 pb-5 last:pb-0"
                >
                  {index < ACTIVITIES.length - 1 && (
                    <span
                      className="absolute bottom-0 left-2 top-3 w-px bg-border"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 ring-surface ${item.dotOuter}`}
                    aria-hidden="true"
                  >
                    <span className={`h-2 w-2 rounded-full ${item.dotInner}`} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard title="Company Research Activity">
            <BarChart
              data={RESEARCH_ACTIVITY}
              yTicks={[0, 3, 6, 9, 12]}
              max={12}
              barClass="fill-info"
              ariaLabel="Company research activity per day of the week"
            />
          </ChartCard>
        </div>

        {/* Row 3 — area chart + distribution bar chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Jobs Found Over Time">
            <AreaLineChart
              data={JOBS_OVER_TIME}
              yTicks={[0, 25, 50, 75, 100]}
              max={100}
              ariaLabel="Jobs found over time per day of the week"
            />
          </ChartCard>

          <ChartCard title="Match Score Distribution">
            <BarChart
              data={SCORE_DISTRIBUTION}
              yTicks={[0, 25, 50, 75, 100]}
              max={100}
              barClass="fill-success"
              ariaLabel="Match score distribution by score range"
            />
          </ChartCard>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
