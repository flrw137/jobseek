"use server";

import { createInsforgeServer } from "@/lib/insforge-server";
import type { ResearchDossier } from "@/agent/types";

export interface SavedJob {
  id: string;
  title: string | null;
  company: string | null;
  salary: string | null;
  match_score: number;
  found_at: string;
}

export interface JobDetail {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  source_url: string | null;
  external_apply_url: string | null;
  about_role: string | null;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  about_company: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[];
  missing_skills: string[];
  company_research: ResearchDossier | null;
  found_at: string;
}

export async function getJob(jobId: string) {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { job: null, error: "You must be signed in." };
  }

  const { data, error } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    return { job: null, error: error.message };
  }
  if (!data) {
    return { job: null, error: "Job not found." };
  }

  const job = data as unknown as JobDetail;
  return {
    job: {
      ...job,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.filter(Boolean) : [],
      requirements: Array.isArray(job.requirements) ? job.requirements.filter(Boolean) : [],
      nice_to_have: Array.isArray(job.nice_to_have) ? job.nice_to_have.filter(Boolean) : [],
      benefits: Array.isArray(job.benefits) ? job.benefits.filter(Boolean) : [],
      matched_skills: Array.isArray(job.matched_skills) ? job.matched_skills.filter(Boolean) : [],
      missing_skills: Array.isArray(job.missing_skills) ? job.missing_skills.filter(Boolean) : [],
    },
    error: null,
  };
}

export async function getSavedJobs() {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { jobs: [], error: "You must be signed in." };
  }

  const { data, error } = await insforge.database
    .from("jobs")
    .select("id, title, company, salary, match_score, found_at")
    .eq("user_id", session.user.id)
    .order("found_at", { ascending: false });

  if (error) {
    return { jobs: [], error: error.message };
  }

  return {
    jobs: (data as unknown as SavedJob[]).map((job) => ({
      id: job.id,
      title: job.title ?? "",
      company: job.company ?? "",
      salary: job.salary,
      match_score: job.match_score,
      found_at: job.found_at,
    })),
    error: null,
  };
}

export interface DashboardStats {
  totalJobsFound: number;
  avgMatchRate: number | null;
  companiesResearched: number;
  jobsThisWeek: number;
  totalJobsTrend: number | null;
  avgMatchRateTrend: number | null;
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardStats() {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { stats: null, error: "You must be signed in." };
  }
  const userId = session.user.id;

  const now = Date.now();
  const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const prevWeekStart = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { count: totalCount, error: totalError } = await insforge.database
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: researchedCount, error: researchedError } = await insforge.database
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("company_research", "is", null);

  const { data: jobScores, error: scoresError } = await insforge.database
    .from("jobs")
    .select("match_score, found_at")
    .eq("user_id", userId);

  if (totalError || researchedError || scoresError) {
    return {
      stats: null,
      error:
        (totalError?.message ?? researchedError?.message ?? scoresError?.message) ||
        "Could not load your dashboard stats.",
    };
  }

  const rows = (jobScores ?? []) as unknown as Array<{
    match_score: number | null;
    found_at: string;
  }>;

  const scores = rows.filter((row) => typeof row.match_score === "number");
  const avgMatchRate =
    scores.length > 0
      ? Math.round(scores.reduce((sum, row) => sum + (row.match_score as number), 0) / scores.length)
      : null;

  const thisWeek = rows.filter((row) => row.found_at >= weekStart).length;
  const prevWeek = rows.filter((row) => row.found_at >= prevWeekStart && row.found_at < weekStart).length;

  const thisWeekScores = scores.filter((row) => row.found_at >= weekStart);
  const prevWeekScores = scores.filter((row) => row.found_at >= prevWeekStart && row.found_at < weekStart);
  const thisWeekAvg =
    thisWeekScores.length > 0
      ? thisWeekScores.reduce((sum, row) => sum + (row.match_score as number), 0) / thisWeekScores.length
      : 0;
  const prevWeekAvg =
    prevWeekScores.length > 0
      ? prevWeekScores.reduce((sum, row) => sum + (row.match_score as number), 0) / prevWeekScores.length
      : 0;

  return {
    stats: {
      totalJobsFound: totalCount ?? 0,
      avgMatchRate,
      companiesResearched: researchedCount ?? 0,
      jobsThisWeek: thisWeek,
      totalJobsTrend: pctChange(thisWeek, prevWeek),
      avgMatchRateTrend:
        prevWeekScores.length > 0 && thisWeekScores.length > 0
          ? Math.round(thisWeekAvg - prevWeekAvg)
          : null,
    } as DashboardStats,
    error: null,
  };
}
