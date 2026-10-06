import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export interface JobToScore {
  id: string;
  title: string;
  company: string;
  description: string;
}

export interface ProfileForScoring {
  current_title: string;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: Array<{ company: string; title: string }>;
  job_titles_seeking: string[];
  remote_preference: string | null;
}

export interface JobScore {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export type JobScores = Record<string, JobScore>;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 8);
}

function parseJsonContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      return JSON.parse(fenced[1]);
    }
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error("The model did not return valid JSON.");
  }
}

const SYSTEM_PROMPT = `You are a job matching assistant. You are given a candidate profile and a list of job postings.

For EACH job, score how well the candidate matches that job from 0 to 100 and explain why.

Return ONLY a single JSON object — no markdown, no commentary. It must be keyed by the exact job id, like this:

{
  "JOB_ID_1": {
    "matchScore": number,
    "matchReason": string,
    "matchedSkills": string[],
    "missingSkills": string[]
  },
  "JOB_ID_2": { ... }
}

Rules:
- Include an entry for EVERY job id provided. Never skip or merge jobs.
- matchScore is 0-100. Base it on: skill overlap, experience level and years, how closely the role matches the candidate's job titles seeking, remote preference, and how their past roles line up.
- matchReason is 1-2 sentences explaining the score, specific to this candidate.
- matchedSkills: skills from the candidate's profile that the job needs or clearly values.
- missingSkills: important skills the job requires that the candidate does not list. Empty array if none.
- Never invent skills, credentials, or employers. Only reason from the data provided.
- Be strict on seniority: a junior candidate should not score high on senior roles.`;

const BATCH_SIZE = 15;
const MAX_TOKENS = 4096;

export async function scoreJobs(
  profile: ProfileForScoring,
  jobs: JobToScore[],
): Promise<JobScores> {
  if (jobs.length === 0) return {};

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const raw: Record<string, unknown> = {};
  for (let offset = 0; offset < jobs.length; offset += BATCH_SIZE) {
    const batch = jobs.slice(offset, offset + BATCH_SIZE);
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `CANDIDATE PROFILE (JSON):\n\n${JSON.stringify(profile, null, 2)}\n\nJOB POSTINGS (JSON):\n\n${JSON.stringify(batch, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("The model returned an empty response.");
    }

    const parsed = parseJsonContent(content);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("The model returned an unexpected response.");
    }
    Object.assign(raw, parsed as Record<string, unknown>);
  }

  const scores = normalizeScores(raw, jobs);
  if (Object.keys(scores).length < jobs.length) {
    console.warn(
      `matcher: scored ${Object.keys(scores).length}/${jobs.length} jobs; the model omitted the rest.`,
    );
  }
  return scores;
}

function normalizeScores(raw: unknown, jobs: JobToScore[]): JobScores {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("The model returned an unexpected response.");
  }
  const record = raw as Record<string, unknown>;

  const scores: JobScores = {};
  for (const job of jobs) {
    const entry = record[String(job.id)];
    if (typeof entry !== "object" || entry === null) {
      continue;
    }
    const value = entry as Record<string, unknown>;
    scores[job.id] = {
      matchScore: asNumber(value.matchScore),
      matchReason: asString(value.matchReason),
      matchedSkills: asStringArray(value.matchedSkills),
      missingSkills: asStringArray(value.missingSkills),
    };
  }
  return scores;
}
