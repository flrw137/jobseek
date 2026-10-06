import { searchJobs, type AdzunaJob } from "@/lib/adzuna";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { scoreJobs, type ProfileForScoring } from "./matcher";

export interface DiscoverProfile {
  current_title: string;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: Array<{ company: string; title: string }> | null;
  job_titles_seeking: string[];
  remote_preference: string | null;
}

export interface JobRecord {
  source: "search";
  source_url: string;
  external_apply_url: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  job_type: string;
  about_role: string;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  found_at: string;
}

export interface DiscoveryResult {
  found: number;
  saved: JobRecord[];
  strong: JobRecord[];
}

function truncate(value: string, maxChars: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).replace(/\s+\S*$/, "")}…`;
}

function formatSalary(job: AdzunaJob): string | null {
  const min = job.salary_min != null ? Math.round(job.salary_min / 1000) : null;
  const max = job.salary_max != null ? Math.round(job.salary_max / 1000) : null;

  if (min != null && max != null && min !== max) {
    return `$${min}k - $${max}k`;
  }
  if (min != null) {
    return `$${min}k`;
  }
  if (max != null) {
    return `$${max}k`;
  }
  return null;
}

const CONTRACT_TYPE_TO_JOB_TYPE: Record<string, string> = {
  permanent: "fulltime",
  full_time: "fulltime",
  fulltime: "fulltime",
  part_time: "parttime",
  parttime: "parttime",
  contract: "contract",
  temporary: "contract",
  temp: "contract",
};

function toJobType(contractType: string | undefined): string {
  if (!contractType) return "fulltime";
  const key = contractType.toLowerCase().replace(/[^a-z_]/g, "");
  return CONTRACT_TYPE_TO_JOB_TYPE[key] ?? "fulltime";
}

function toProfileForScoring(profile: DiscoverProfile): ProfileForScoring {
  return {
    current_title: profile.current_title,
    experience_level: profile.experience_level,
    years_experience: profile.years_experience,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    work_experience: Array.isArray(profile.work_experience)
      ? profile.work_experience.filter((role) => role.company || role.title)
      : [],
    job_titles_seeking: Array.isArray(profile.job_titles_seeking)
      ? profile.job_titles_seeking
      : [],
    remote_preference: profile.remote_preference,
  };
}

export async function discoverJobs(
  profile: DiscoverProfile,
  jobTitle: string,
  location: string,
): Promise<DiscoveryResult> {
  const jobs = await searchJobs(jobTitle, location);

  const scores = await scoreJobs(
    toProfileForScoring(profile),
    jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      description: truncate(job.description, 500),
    })),
  );

  const saved: JobRecord[] = [];
  const strong: JobRecord[] = [];

  for (const job of jobs) {
    const score = scores[String(job.id)];
    if (!score) continue;

    const record: JobRecord = {
      source: "search",
      source_url: job.redirect_url,
      external_apply_url: job.redirect_url,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: formatSalary(job),
      job_type: toJobType(job.contract_type),
      about_role: job.description,
      match_score: score.matchScore,
      match_reason: score.matchReason,
      matched_skills: score.matchedSkills,
      missing_skills: score.missingSkills,
      found_at: new Date().toISOString(),
    };

    saved.push(record);
    if (score.matchScore >= MATCH_THRESHOLD) {
      strong.push(record);
    }
  }

  return { found: jobs.length, saved, strong };
}
