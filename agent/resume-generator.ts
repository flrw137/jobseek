import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export interface GeneratedResumeRole {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  bullets: string[];
}

export interface GeneratedResumeContent {
  summary: string;
  roles: GeneratedResumeRole[];
}

export interface ResumeGeneratorInput {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    responsibilities: string;
  }>;
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
  };
  job_titles_seeking: string[];
  remote_preference: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

const SYSTEM_PROMPT = `You polish resume content from a structured profile. The user provides the profile as JSON.

Return ONLY a single JSON object — no markdown, no commentary. Use exactly these keys:

{
  "summary": string,
  "roles": [
    {
      "company": string,
      "title": string,
      "startDate": string,
      "endDate": string,
      "currentlyWorking": boolean,
      "bullets": [string, string]
    }
  ]
}

Rules:
- "summary": a 2-4 sentence professional summary. Open with the candidate's current title and years of experience if provided. Highlight the strongest 2-3 skills. Close by naming the target roles from job_titles_seeking.
- "roles": output EXACTLY one entry per role in the provided work_experience, in the same order. Copy company, title, startDate, endDate, and currentlyWorking verbatim from the input — never change or invent them.
- "bullets": rewrite each role's responsibilities into 2-6 concise, achievement-oriented bullet points. Split a long responsibilities string into multiple bullets. Sharpen the wording but never add facts that are not stated in the responsibilities text — no invented numbers, technologies, or projects.
- Never invent companies, employers, dates, skills, or credentials of any kind. Every claim must trace back to the provided profile.
- If work_experience is empty, return "roles": [].
- If job_titles_seeking is empty, target the summary at the current_title instead.`;

export async function generateResumeContent(
  profile: ResumeGeneratorInput,
): Promise<GeneratedResumeContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `PROFILE (JSON):\n\n${JSON.stringify(profile, null, 2)}`,
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("The model returned an empty response.");
  }

  return normalizeGeneration(parseJsonContent(content), profile);
}

function normalizeGeneration(
  raw: unknown,
  profile: ResumeGeneratorInput,
): GeneratedResumeContent {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("The model returned an unexpected response.");
  }
  const record = raw as Record<string, unknown>;

  const summary = asString(record.summary);

  const roles: GeneratedResumeRole[] = profile.work_experience.map((role, index) => {
    const rawRoles = Array.isArray(record.roles) ? record.roles : [];
    const rawRole =
      typeof rawRoles[index] === "object" && rawRoles[index] !== null
        ? (rawRoles[index] as Record<string, unknown>)
        : {};
    return {
      company: role.company,
      title: role.title,
      startDate: role.startDate,
      endDate: role.endDate,
      currentlyWorking: role.currentlyWorking,
      bullets: asStringArray(rawRole.bullets),
    };
  });

  return { summary, roles };
}
