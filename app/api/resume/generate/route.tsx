import { renderToBuffer } from "@react-pdf/renderer";
import {
  generateResumeContent,
  type ResumeGeneratorInput,
} from "@/agent/resume-generator";
import { createInsforgeServer } from "@/lib/insforge-server";
import { ResumeDocument } from "@/lib/resume-pdf";
import { NextResponse } from "next/server";

const GENERATED_RESUME_TTL = 3600;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface ProfileRow {
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
  }> | null;
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

function toGeneratorInput(profile: ProfileRow): ResumeGeneratorInput {
  return {
    full_name: asString(profile.full_name),
    email: asString(profile.email),
    phone: asString(profile.phone),
    location: asString(profile.location),
    current_title: asString(profile.current_title),
    experience_level: profile.experience_level,
    years_experience: profile.years_experience,
    skills: Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [],
    work_experience: Array.isArray(profile.work_experience)
      ? profile.work_experience
          .filter((role) => asString(role.company) || asString(role.title))
          .map((role) => ({
            company: asString(role.company),
            title: asString(role.title),
            startDate: asString(role.startDate),
            endDate: asString(role.endDate),
            currentlyWorking: Boolean(role.currentlyWorking),
            responsibilities: asString(role.responsibilities),
          }))
      : [],
    education: {
      degree: asString(profile.education?.degree),
      fieldOfStudy: asString(profile.education?.fieldOfStudy),
      institution: asString(profile.education?.institution),
      graduationYear: asString(profile.education?.graduationYear),
    },
    job_titles_seeking: Array.isArray(profile.job_titles_seeking)
      ? profile.job_titles_seeking.filter(Boolean)
      : [],
    remote_preference: profile.remote_preference,
    linkedin_url: profile.linkedin_url,
    portfolio_url: profile.portfolio_url,
  };
}

export async function POST() {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return jsonError("You must be signed in.", 401);
  }
  const userId = session.user.id;

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return jsonError(`Could not load your profile: ${profileError.message}`, 500);
  }
  if (!profile) {
    return jsonError("Save your profile before generating a resume.", 422);
  }

  const input = toGeneratorInput(profile as ProfileRow);

  if (!input.full_name) {
    return jsonError("Add your full name before generating a resume.", 422);
  }
  if (input.work_experience.length === 0 && input.skills.length === 0) {
    return jsonError(
      "Add your work experience or skills before generating a resume.",
      422,
    );
  }

  let content;
  try {
    content = await generateResumeContent(input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Resume generation failed. Try again.";
    return jsonError(message, 502);
  }

  const resumeElement = <ResumeDocument profile={input} content={content} />;
  let buffer;
  try {
    buffer = await renderToBuffer(resumeElement);
  } catch {
    return jsonError("Could not render your resume PDF. Try again.", 502);
  }

  const resumeKey = `generated/${userId}/resume.pdf`;
  const pdfBlob = new Blob([buffer as unknown as BlobPart], {
    type: "application/pdf",
  });
  const { error: uploadError } = await insforge.storage
    .from("resumes")
    .upload(resumeKey, pdfBlob);

  if (uploadError) {
    return jsonError(`Could not save the generated resume: ${uploadError.message}`, 502);
  }

  const { data: signedUrlData, error: signedUrlError } = await insforge.storage
    .from("resumes")
    .createSignedUrl(resumeKey, GENERATED_RESUME_TTL);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return jsonError("Could not generate a link for your resume. Try again.", 502);
  }

  return NextResponse.json({ url: signedUrlData.signedUrl });
}
