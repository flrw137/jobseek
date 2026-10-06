import { researchCompany, type ProfileForResearch } from "@/agent/research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import { NextResponse } from "next/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface JobRow {
  id: string;
  title: string | null;
  company: string | null;
  about_role: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  source_url: string | null;
  external_apply_url: string | null;
}

interface ProfileRow {
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  work_experience: Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    responsibilities?: string;
  }> | null;
}

function toProfileForResearch(profile: ProfileRow): ProfileForResearch {
  return {
    current_title: asString(profile.current_title),
    experience_level: asString(profile.experience_level) || null,
    years_experience: profile.years_experience,
    skills: Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [],
    work_experience: Array.isArray(profile.work_experience)
      ? profile.work_experience.map((role) => ({
          company: asString(role.company),
          title: asString(role.title),
          startDate: asString(role.startDate),
          endDate: asString(role.endDate),
          currentlyWorking: Boolean(role.currentlyWorking),
          responsibilities: asString(role.responsibilities),
        }))
      : null,
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

  const jobId = asString(body.jobId);
  if (!jobId) {
    return jsonError("Job id is required.", 400);
  }

  const { data: job, error: jobError } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (jobError) {
    return jsonError(`Could not load this job: ${jobError.message}`, 500);
  }
  if (!job) {
    return jsonError("Job not found.", 404);
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return jsonError(`Could not load your profile: ${profileError.message}`, 500);
  }
  if (!profile) {
    return jsonError("Save your profile before running company research.", 422);
  }

  const row = job as unknown as JobRow;

  let result;
  try {
    result = await researchCompany(
      {
        title: row.title,
        company: row.company,
        about_role: row.about_role,
        matched_skills: Array.isArray(row.matched_skills) ? row.matched_skills.filter(Boolean) : [],
        missing_skills: Array.isArray(row.missing_skills) ? row.missing_skills.filter(Boolean) : [],
        source_url: row.source_url ?? row.external_apply_url,
      },
      toProfileForResearch(profile as ProfileRow),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Company research failed. Please try again.";
    return jsonError(message, 502);
  }

  const { error: updateError } = await insforge.database
    .from("jobs")
    .update({ company_research: result.dossier })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (updateError) {
    return jsonError(`Could not save the research dossier: ${updateError.message}`, 500);
  }

  const posthog = createPostHogServer();
  posthog.capture({
    distinctId: userId,
    event: "company_researched",
    properties: { userId, jobId, company: row.company ?? "" },
  });
  await posthog.shutdown();

  return NextResponse.json({
    dossier: result.dossier,
    browserSkipped: result.browserSkipped,
  });
}
