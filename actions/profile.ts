"use server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { computeProfileCompletion } from "@/lib/profile-completion";
import { revalidatePath } from "next/cache";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

interface WorkExperienceRow {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

interface EducationRow {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

interface ProfilePayload {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceRow[] | null;
  education: EducationRow;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url?: string;
  is_complete?: boolean;
}

const WORK_AUTHORIZATION_VALUES: Record<string, string> = {
  citizen: "citizen",
  "permanent resident": "permanent_resident",
  permanent_resident: "permanent_resident",
  "visa required": "visa_required",
  visa_required: "visa_required",
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  return asString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asNumber(value: unknown): number | null {
  const parsed = Number(asString(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function asBool(value: unknown): boolean {
  return asString(value) === "true";
}

export async function getProfile() {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { profile: null, error: "You must be signed in." };
  }

  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data as ProfilePayload | null, error: null };
}

export async function getResumeUrl() {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { url: null, error: "You must be signed in." };
  }

  const { data, error } = await insforge.storage
    .from("resumes")
    .createSignedUrl(`${session.user.id}/resume.pdf`, 3600);

  if (error || !data?.signedUrl) {
    return {
      url: null,
      error: error?.message ?? "Could not generate a link for your resume.",
    };
  }

  return { url: data.signedUrl, error: null };
}

export async function saveProfile(formData: FormData) {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return { success: false, error: "You must be signed in to save your profile." };
  }
  const userId = session.user.id;

  const roleCount = Number(asString(formData.get("roles.length"))) || 0;
  const workExperience: WorkExperienceRow[] = [];
  for (let index = 0; index < roleCount; index++) {
    const company = asString(formData.get(`roles.${index}.company`));
    const title = asString(formData.get(`roles.${index}.title`));
    if (!company && !title) continue;
    workExperience.push({
      company,
      title,
      startDate: asString(formData.get(`roles.${index}.startDate`)),
      endDate: asString(formData.get(`roles.${index}.endDate`)),
      currentlyWorking: asBool(formData.get(`roles.${index}.currentlyWorking`)),
      responsibilities: asString(formData.get(`roles.${index}.responsibilities`)),
    });
  }

  const education: EducationRow = {
    degree: asString(formData.get("degree")),
    fieldOfStudy: asString(formData.get("fieldOfStudy")),
    institution: asString(formData.get("institution")),
    graduationYear: asString(formData.get("graduationYear")),
  };

  const profile: ProfilePayload = {
    id: userId,
    full_name: asString(formData.get("fullName")),
    email: asString(formData.get("email")),
    phone: asString(formData.get("phone")),
    location: asString(formData.get("location")),
    current_title: asString(formData.get("currentTitle")),
    experience_level: asString(formData.get("experienceLevel")).toLowerCase() || null,
    years_experience: asNumber(formData.get("yearsExperience")),
    skills: formData
      .getAll("skills")
      .map((value) => asString(value))
      .filter(Boolean),
    industries: formData
      .getAll("industries")
      .map((value) => asString(value))
      .filter(Boolean),
    work_experience: workExperience.length ? workExperience : null,
    education,
    job_titles_seeking: asStringArray(formData.get("jobTitlesSeeking")),
    remote_preference: asString(formData.get("remotePreference")).toLowerCase() || null,
    preferred_locations: asStringArray(formData.get("preferredLocations")),
    salary_expectation: asString(formData.get("salaryExpectation")) || null,
    linkedin_url: asString(formData.get("linkedinUrl")) || null,
    portfolio_url: asString(formData.get("portfolioUrl")) || null,
    work_authorization:
      WORK_AUTHORIZATION_VALUES[asString(formData.get("workAuthorization")).toLowerCase()] ??
      null,
  };

  let resumeSaved = false;
  const resume = formData.get("resume");
  if (resume instanceof File) {
    const isPdf =
      resume.type === "application/pdf" || resume.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return { success: false, error: "Resume must be a PDF file." };
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return { success: false, error: "Resume must be 5MB or smaller." };
    }

    const resumeKey = `${userId}/resume.pdf`;
    const { error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(resumeKey, resume);
    if (uploadError) {
      return { success: false, error: `Could not upload resume: ${uploadError.message}` };
    }

    const { data: publicUrlData } = insforge.storage.from("resumes").getPublicUrl(resumeKey);
    profile.resume_pdf_url = publicUrlData?.publicUrl;
    resumeSaved = true;
  }

  const { percent, missing, isComplete } = computeProfileCompletion(profile);
  profile.is_complete = isComplete;

  const { error: saveError } = await insforge.database
    .from("profiles")
    .upsert([profile], { onConflict: "id" });

  if (saveError) {
    return { success: false, error: `Could not save profile: ${saveError.message}` };
  }

  revalidatePath("/profile");

  return { success: true, error: null, completion: { percent, missing }, resumeSaved };
}
