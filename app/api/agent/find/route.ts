import { discoverJobs, type DiscoverProfile } from "@/agent/adzuna";
import { createInsforgeServer } from "@/lib/insforge-server";
import { NextResponse } from "next/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface ProfileRow {
  current_title: string;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: Array<{ company?: string; title?: string }> | null;
  job_titles_seeking: string[];
  remote_preference: string | null;
}

function toDiscoverProfile(profile: ProfileRow): DiscoverProfile {
  return {
    current_title: asString(profile.current_title),
    experience_level: profile.experience_level,
    years_experience: profile.years_experience,
    skills: Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [],
    work_experience: Array.isArray(profile.work_experience)
      ? profile.work_experience
          .map((role) => ({
            company: asString(role.company),
            title: asString(role.title),
          }))
          .filter((role) => role.company || role.title)
      : [],
    job_titles_seeking: Array.isArray(profile.job_titles_seeking)
      ? profile.job_titles_seeking.filter(Boolean)
      : [],
    remote_preference: profile.remote_preference,
  };
}

export async function POST(request: Request) {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return jsonError("You must be signed in.", 401);
  }
  const userId = session.user.id;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const jobTitle = asString(body.jobTitle);
  if (!jobTitle) {
    return jsonError("Job title is required.", 400);
  }
  const location = asString(body.location);

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return jsonError(`Could not load your profile: ${profileError.message}`, 500);
  }
  if (!profile) {
    return jsonError("Save your profile before searching for jobs.", 422);
  }

  let result;
  try {
    result = await discoverJobs(toDiscoverProfile(profile as ProfileRow), jobTitle, location);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Job search failed. Please try again.";
    return jsonError(message, 502);
  }

  const runId = await createAgentRun(userId, jobTitle, location, result.saved.length);
  if (!runId) {
    return jsonError("Could not record this search. Please try again.", 500);
  }

  const existing = await insforge.database
    .from("jobs")
    .select("source_url")
    .eq("user_id", userId);

  if (existing.error) {
    return jsonError(`Could not load saved jobs: ${existing.error.message}`, 500);
  }

  const existingUrls = new Set(
    (existing.data ?? []).map((row: { source_url: string }) => row.source_url),
  );
  const toInsert = result.saved.filter((record) => !existingUrls.has(record.source_url));

  if (toInsert.length > 0) {
    const { error: insertError } = await insforge.database
      .from("jobs")
      .insert(
        toInsert.map((record) => ({ ...record, user_id: userId, run_id: runId })),
      );

    if (insertError) {
      return jsonError(`Could not save jobs: ${insertError.message}`, 500);
    }
  }

  const { data: allRows } = await insforge.database
    .from("jobs")
    .select("id, source_url")
    .eq("user_id", userId);
  const urlToId = new Map(
    (allRows ?? []).map((row: { id: string; source_url: string }) => [
      row.source_url,
      row.id,
    ]),
  );

  const jobs = result.saved.map((record) => ({
    ...record,
    id: urlToId.get(record.source_url) ?? record.source_url,
  }));

  return NextResponse.json({
    jobs,
    found: result.found,
    saved: result.strong.length,
  });
}

async function createAgentRun(
  userId: string,
  jobTitle: string,
  location: string,
  jobsFound: number,
): Promise<string | null> {
  const insforge = await createInsforgeServer();
  const now = new Date().toISOString();
  const { data, error } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "completed",
        job_title_searched: jobTitle,
        location_searched: location || null,
        jobs_found: jobsFound,
        started_at: now,
        completed_at: now,
      },
    ])
    .select()
    .single();

  if (error || !data) return null;
  return (data as { id: string }).id;
}
