export interface ProfileCompletionInput {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  current_title?: string | null;
  experience_level?: string | null;
  years_experience?: number | null;
  skills?: string[] | null;
  work_experience?: Array<{ company?: string | null; title?: string | null }> | null;
  education?: {
    degree?: string | null;
    fieldOfStudy?: string | null;
    institution?: string | null;
    graduationYear?: string | null;
  } | null;
  job_titles_seeking?: string[] | null;
  remote_preference?: string | null;
  work_authorization?: string | null;
}

export interface ProfileCompletionResult {
  percent: number;
  missing: string[];
  isComplete: boolean;
}

function hasValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function educationComplete(education: ProfileCompletionInput["education"]): boolean {
  return Boolean(
    education &&
      hasValue(education.degree) &&
      hasValue(education.fieldOfStudy) &&
      hasValue(education.institution) &&
      hasValue(education.graduationYear),
  );
}

export function computeProfileCompletion(
  profile: ProfileCompletionInput,
): ProfileCompletionResult {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: "NAME", ok: hasValue(profile.full_name) },
    { label: "PHONE", ok: hasValue(profile.phone) },
    { label: "LOCATION", ok: hasValue(profile.location) },
    { label: "JOB TITLE", ok: hasValue(profile.current_title) },
    { label: "EXPERIENCE LEVEL", ok: hasValue(profile.experience_level) },
    {
      label: "YEARS",
      ok: typeof profile.years_experience === "number" && profile.years_experience >= 0,
    },
    { label: "SKILLS", ok: Array.isArray(profile.skills) && profile.skills.length > 0 },
    {
      label: "WORK EXPERIENCE",
      ok:
        Array.isArray(profile.work_experience) &&
        profile.work_experience.some(
          (role) => hasValue(role.company) || hasValue(role.title),
        ),
    },
    { label: "EDUCATION", ok: educationComplete(profile.education) },
    {
      label: "JOB TITLES",
      ok: Array.isArray(profile.job_titles_seeking) && profile.job_titles_seeking.length > 0,
    },
    { label: "REMOTE", ok: hasValue(profile.remote_preference) },
    { label: "WORK AUTH", ok: hasValue(profile.work_authorization) },
  ];

  const missing = checks.filter((check) => !check.ok).map((check) => check.label);
  const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);

  return { percent, missing, isComplete: missing.length === 0 };
}
