import OpenAI from "openai";
import type {
  ExtractedEducation,
  ExtractedProfile,
  ExtractedWorkExperience,
} from "./types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const EXPERIENCE_LEVEL_OPTIONS = ["Junior", "Mid", "Senior", "Lead"];
const REMOTE_PREFERENCE_OPTIONS = ["Remote", "Onsite", "Hybrid", "Any"];
const WORK_AUTHORIZATION_OPTIONS = [
  "Citizen",
  "Permanent Resident",
  "Visa Required",
];
const DEGREE_OPTIONS = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);
}

function asNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true";
}

function asOption(value: unknown, options: string[]): string {
  const text = asString(value);
  return options.includes(text) ? text : "";
}

function asWorkExperience(value: unknown): ExtractedWorkExperience[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const record = entry as Record<string, unknown>;
      const company = asString(record.company);
      const title = asString(record.title);
      if (!company && !title) return null;
      return {
        company,
        title,
        startDate: asString(record.startDate),
        endDate: asString(record.endDate),
        currentlyWorking: asBool(record.currentlyWorking),
        responsibilities: asString(record.responsibilities),
      };
    })
    .filter((entry): entry is ExtractedWorkExperience => entry !== null);
}

function asEducation(value: unknown): ExtractedEducation {
  if (typeof value !== "object" || value === null) {
    return { degree: "", fieldOfStudy: "", institution: "", graduationYear: "" };
  }
  const record = value as Record<string, unknown>;
  return {
    degree: asOption(record.degree, DEGREE_OPTIONS),
    fieldOfStudy: asString(record.fieldOfStudy),
    institution: asString(record.institution),
    graduationYear: asString(record.graduationYear),
  };
}

function normalizeExtraction(raw: unknown): ExtractedProfile {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("The model returned an unexpected response.");
  }
  const record = raw as Record<string, unknown>;

  return {
    full_name: asString(record.full_name),
    phone: asString(record.phone),
    location: asString(record.location),
    current_title: asString(record.current_title),
    experience_level: asOption(record.experience_level, EXPERIENCE_LEVEL_OPTIONS),
    years_experience: asNumber(record.years_experience),
    skills: asStringArray(record.skills),
    industries: asStringArray(record.industries),
    work_experience: asWorkExperience(record.work_experience),
    education: asEducation(record.education),
    job_titles_seeking: asStringArray(record.job_titles_seeking),
    remote_preference: asOption(record.remote_preference, REMOTE_PREFERENCE_OPTIONS),
    salary_expectation: asString(record.salary_expectation),
    linkedin_url: asString(record.linkedin_url),
    portfolio_url: asString(record.portfolio_url),
    work_authorization: asOption(record.work_authorization, WORK_AUTHORIZATION_OPTIONS),
  };
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

const SYSTEM_PROMPT = `You extract structured profile data from a resume. The user provides raw text extracted from a PDF resume.

Return ONLY a single JSON object — no markdown, no commentary. Use exactly these keys:

{
  "full_name": string,
  "phone": string,
  "location": string,
  "current_title": string,
  "experience_level": string,
  "years_experience": number | null,
  "skills": string[],
  "industries": string[],
  "work_experience": [
    {
      "company": string,
      "title": string,
      "startDate": string,
      "endDate": string,
      "currentlyWorking": boolean,
      "responsibilities": string
    }
  ],
  "education": {
    "degree": string,
    "fieldOfStudy": string,
    "institution": string,
    "graduationYear": string
  },
  "job_titles_seeking": string[],
  "remote_preference": string,
  "salary_expectation": string,
  "linkedin_url": string,
  "portfolio_url": string,
  "work_authorization": string
}

Rules:
- Extract only what the resume explicitly states. Never invent phone numbers, URLs, skills, companies, or dates.
- If a field is not present in the resume, use "" for strings, [] for arrays, null for years_experience, and {} for education.
- experience_level must be one of: Junior, Mid, Senior, Lead.
- remote_preference must be one of: Remote, Onsite, Hybrid, Any.
- work_authorization must be one of: Citizen, Permanent Resident, Visa Required.
- education.degree must be one of: High School, Associate Degree, Bachelor's Degree, Master's Degree, PhD. Use "High School" only if no degree is listed.
- Dates use MM/YYYY or YYYY format. Set currentlyWorking to true when a role has no end date.
- years_experience is the total years of professional experience if stated or clearly inferable, otherwise null.`;

export async function extractProfileFromResume(text: string): Promise<ExtractedProfile> {
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
      { role: "user", content: `RESUME TEXT:\n\n${text}` },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("The model returned an empty response.");
  }

  return normalizeExtraction(parseJsonContent(content));
}
