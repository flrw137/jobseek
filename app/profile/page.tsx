"use client";

import { getProfile, getResumeUrl, saveProfile } from "@/actions/profile";
import { getSessionUser } from "@/actions/session";
import SiteNavbar from "@/components/site-navbar";
import { computeProfileCompletion } from "@/lib/profile-completion";
import type { ExtractedProfile } from "@/agent/types";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useEffect, useRef, useState } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

/* ────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────── */

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6.5H14M5.5 1.5V3.5M10.5 1.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M10 13.5V3.5M10 3.5L6.5 7M10 3.5L13.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13.5V14.5C3 15.8807 4.11929 17 5.5 17H14.5C15.8807 17 17 15.8807 17 14.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 13.5H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 10L9 12.5L13.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M9.5 2.5L2.5 9.5M2.5 2.5L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SaveIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 2H11.5L13.5 4V13.5H3V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 2V5.5H10.5V2M5 10.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Small UI building blocks
   ──────────────────────────────────────────────────────────── */

const inputBase =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary shadow-xs placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  readOnly = false,
  icon,
}: {
  id: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </span>
      )}
      <input
        id={id}
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${icon ? "pl-9" : ""} ${
          readOnly ? "cursor-not-allowed bg-surface-secondary/60" : ""
        }`}
      />
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} cursor-pointer appearance-none pr-9`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} resize-none leading-relaxed`}
    />
  );
}

function TagInput({
  id,
  tags,
  onChange,
  placeholder,
  addLabel = "Add",
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setDraft("");
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className={inputBase}
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-xs transition-all duration-200 hover:bg-surface-secondary"
        >
          {addLabel}
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-medium text-text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-text-muted transition-colors duration-200 hover:text-error"
                aria-label={`Remove ${tag}`}
              >
                <XIcon />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-base font-semibold text-text-primary">{children}</h3>
      {right}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Progress ring (completion indicator)
   ──────────────────────────────────────────────────────────── */

function ProgressRing({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg
        viewBox="0 0 76 76"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Profile ${value}% complete`}
      >
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-border-light"
        />
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-error transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold leading-none text-text-primary">{value}%</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

interface RoleEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

/* ────────────────────────────────────────────────────────────
   Saved profile shape + label mapping helpers
   ──────────────────────────────────────────────────────────── */

interface SavedProfile {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  current_title?: string | null;
  experience_level?: string | null;
  years_experience?: number | null;
  skills?: string[] | null;
  industries?: string[] | null;
  work_experience?: Array<{
    company?: string | null;
    title?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    currentlyWorking?: boolean;
    responsibilities?: string | null;
  }> | null;
  education?: {
    degree?: string | null;
    fieldOfStudy?: string | null;
    institution?: string | null;
    graduationYear?: string | null;
  } | null;
  job_titles_seeking?: string[] | null;
  remote_preference?: string | null;
  preferred_locations?: string[] | null;
  salary_expectation?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  work_authorization?: string | null;
  resume_pdf_url?: string | null;
}

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

const REMOTE_PREFERENCE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "Onsite",
  hybrid: "Hybrid",
  any: "Any",
};

const WORK_AUTHORIZATION_LABELS: Record<string, string> = {
  citizen: "Citizen",
  permanent_resident: "Permanent Resident",
  visa_required: "Visa Required",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const justSignedIn = searchParams.get("signedIn") === "true";

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    posthog.capture("user_signed_out");
    posthog.reset();
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Proceed with redirect even if sign-out request fails
    }
    router.replace("/login");
  };

  /* ── Form state (pre-filled from the saved profile) ── */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [workAuthorization, setWorkAuthorization] = useState("Citizen");

  const [currentTitle, setCurrentTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Junior");
  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const roleIdCounter = useRef(1);

  const [degree, setDegree] = useState("High School");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const [jobTitlesSeeking, setJobTitlesSeeking] = useState("");
  const [remotePreference, setRemotePreference] = useState("Any");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");

  const [dragging, setDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeOnFile, setResumeOnFile] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeLinkLoading, setResumeLinkLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<{
    percent: number;
    missing: string[];
  } | null>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { user, error } = await getSessionUser();
      if (cancelled) return;
      if (error || !user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      const authenticatedUser = user as User;
      posthog.identify(authenticatedUser.id, {
        email: authenticatedUser.email,
        name: authenticatedUser.name,
      });
      setEmail(authenticatedUser.email ?? "");

      const { profile, error: profileError } = await getProfile();
      if (cancelled) return;

      if (!profileError && profile) {
        const saved = profile as SavedProfile;
        setFullName(saved.full_name ?? "");
        setPhone(saved.phone ?? "");
        setLocation(saved.location ?? "");
        setLinkedinUrl(saved.linkedin_url ?? "");
        setPortfolioUrl(saved.portfolio_url ?? "");
        setWorkAuthorization(
          WORK_AUTHORIZATION_LABELS[saved.work_authorization ?? ""] ?? "Citizen",
        );
        setCurrentTitle(saved.current_title ?? "");
        setExperienceLevel(
          EXPERIENCE_LEVEL_LABELS[saved.experience_level ?? ""] ?? "Junior",
        );
        setYearsExperience(
          saved.years_experience != null ? String(saved.years_experience) : "",
        );
        setSkills(saved.skills ?? []);
        setIndustries(saved.industries ?? []);
        if (Array.isArray(saved.work_experience) && saved.work_experience.length > 0) {
          setRoles(
            saved.work_experience.map((role, index) => ({
              id: `role-${index}`,
              company: role.company ?? "",
              title: role.title ?? "",
              startDate: role.startDate ?? "",
              endDate: role.endDate ?? "",
              currentlyWorking: Boolean(role.currentlyWorking),
              responsibilities: role.responsibilities ?? "",
            })),
          );
        }
        const education = saved.education ?? {};
        setDegree(education.degree ?? "High School");
        setFieldOfStudy(education.fieldOfStudy ?? "");
        setInstitution(education.institution ?? "");
        setGraduationYear(education.graduationYear ?? "");
        setJobTitlesSeeking((saved.job_titles_seeking ?? []).join(", "));
        setRemotePreference(
          REMOTE_PREFERENCE_LABELS[saved.remote_preference ?? ""] ?? "Any",
        );
        setSalaryExpectation(saved.salary_expectation ?? "");
        setPreferredLocations((saved.preferred_locations ?? []).join(", "));
        setResumeOnFile(Boolean(saved.resume_pdf_url));
        setCompletion(computeProfileCompletion(saved));
      } else {
        setCompletion(computeProfileCompletion({}));
      }

      if (justSignedIn) {
        setSuccessTitle("Signed in successfully");
        setSuccessMessage(
          `Welcome back, ${authenticatedUser.name || authenticatedUser.email || "friend"}!`,
        );
        setShowSuccess(true);
        successTimer.current = setTimeout(() => setShowSuccess(false), 5000);
        window.history.replaceState(null, "", "/profile");
      }

      setLoading(false);
    }

    init().catch(() => {
      if (!cancelled) {
        setLoading(false);
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, justSignedIn]);

  const handleResumeFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSaveError("Resume must be a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Resume must be 5MB or smaller.");
      return;
    }
    setSaveError(null);
    setExtractError(null);
    setResumeUrl(null);
    setResumeFile(file);
  };

  const handleViewResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resumeUrl) {
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setResumeLinkLoading(true);
    const { url, error } = await getResumeUrl();
    setResumeLinkLoading(false);
    if (error || !url) {
      setSaveError(error ?? "Could not open your resume. Try again.");
      return;
    }
    setResumeUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleResumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleResumeFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const applyExtraction = (extracted: ExtractedProfile) => {
    const mergedWorkExperience =
      extracted.work_experience.length > 0
        ? extracted.work_experience.map((role) => ({
            company: role.company,
            title: role.title,
          }))
        : roles.map((role) => ({ company: role.company, title: role.title }));
    const mergedJobTitles = extracted.job_titles_seeking.length
      ? extracted.job_titles_seeking
      : jobTitlesSeeking
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    setCompletion(
      computeProfileCompletion({
        full_name: extracted.full_name || fullName,
        phone: extracted.phone || phone,
        location: extracted.location || location,
        current_title: extracted.current_title || currentTitle,
        experience_level: extracted.experience_level || experienceLevel,
        years_experience:
          extracted.years_experience ??
          (yearsExperience ? Number(yearsExperience) : null),
        skills: extracted.skills.length ? extracted.skills : skills,
        work_experience: mergedWorkExperience,
        education: {
          degree: extracted.education.degree || degree,
          fieldOfStudy: extracted.education.fieldOfStudy || fieldOfStudy,
          institution: extracted.education.institution || institution,
          graduationYear: extracted.education.graduationYear || graduationYear,
        },
        job_titles_seeking: mergedJobTitles,
        remote_preference: extracted.remote_preference || remotePreference,
        work_authorization: extracted.work_authorization || workAuthorization,
      }),
    );

    if (extracted.full_name) setFullName(extracted.full_name);
    if (extracted.phone) setPhone(extracted.phone);
    if (extracted.location) setLocation(extracted.location);
    if (extracted.current_title) setCurrentTitle(extracted.current_title);
    if (extracted.experience_level) setExperienceLevel(extracted.experience_level);
    if (extracted.years_experience != null) {
      setYearsExperience(String(extracted.years_experience));
    }
    if (extracted.skills.length) setSkills(extracted.skills);
    if (extracted.industries.length) setIndustries(extracted.industries);
    if (extracted.work_experience.length) {
      setRoles(
        extracted.work_experience.map((role) => ({
          id: `role-${roleIdCounter.current++}`,
          company: role.company,
          title: role.title,
          startDate: role.startDate,
          endDate: role.endDate,
          currentlyWorking: role.currentlyWorking,
          responsibilities: role.responsibilities,
        })),
      );
    }
    if (extracted.education.degree) setDegree(extracted.education.degree);
    if (extracted.education.fieldOfStudy) {
      setFieldOfStudy(extracted.education.fieldOfStudy);
    }
    if (extracted.education.institution) setInstitution(extracted.education.institution);
    if (extracted.education.graduationYear) {
      setGraduationYear(extracted.education.graduationYear);
    }
    if (extracted.job_titles_seeking.length) {
      setJobTitlesSeeking(extracted.job_titles_seeking.join(", "));
    }
    if (extracted.remote_preference) setRemotePreference(extracted.remote_preference);
    if (extracted.salary_expectation) setSalaryExpectation(extracted.salary_expectation);
    if (extracted.linkedin_url) setLinkedinUrl(extracted.linkedin_url);
    if (extracted.portfolio_url) setPortfolioUrl(extracted.portfolio_url);
    if (extracted.work_authorization) {
      setWorkAuthorization(extracted.work_authorization);
    }
  };

  const handleExtractFromResume = async () => {
    if (extracting) return;
    setExtracting(true);
    setExtractError(null);

    const formData = new FormData();
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    let response: Response;
    try {
      response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });
    } catch {
      setExtracting(false);
      setExtractError("Could not reach the server. Please try again.");
      return;
    }

    const payload = await response.json().catch(() => null);
    setExtracting(false);

    if (!response.ok || !payload?.data) {
      setExtractError(payload?.error ?? "Extraction failed. Please try again.");
      return;
    }

    applyExtraction(payload.data as ExtractedProfile);
    setSuccessTitle("Resume extracted");
    setSuccessMessage("Review the filled fields, then save your profile.");
    setShowSuccess(true);
    successTimer.current = setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleGenerateResume = async () => {
    if (generating) return;
    setGenerating(true);
    setGenerateError(null);

    let response: Response;
    try {
      response = await fetch("/api/resume/generate", { method: "POST" });
    } catch {
      setGenerating(false);
      setGenerateError("Could not reach the server. Please try again.");
      return;
    }

    const payload = await response.json().catch(() => null);
    setGenerating(false);

    if (!response.ok || !payload?.url) {
      setGenerateError(payload?.error ?? "Resume generation failed. Please try again.");
      return;
    }

    window.open(payload.url as string, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("location", location);
    formData.append("linkedinUrl", linkedinUrl);
    formData.append("portfolioUrl", portfolioUrl);
    formData.append("workAuthorization", workAuthorization);
    formData.append("currentTitle", currentTitle);
    formData.append("experienceLevel", experienceLevel);
    formData.append("yearsExperience", yearsExperience);
    skills.forEach((skill) => formData.append("skills", skill));
    industries.forEach((industry) => formData.append("industries", industry));
    formData.append("roles.length", String(roles.length));
    roles.forEach((role, index) => {
      formData.append(`roles.${index}.company`, role.company);
      formData.append(`roles.${index}.title`, role.title);
      formData.append(`roles.${index}.startDate`, role.startDate);
      formData.append(`roles.${index}.endDate`, role.endDate);
      formData.append(`roles.${index}.currentlyWorking`, String(role.currentlyWorking));
      formData.append(`roles.${index}.responsibilities`, role.responsibilities);
    });
    formData.append("degree", degree);
    formData.append("fieldOfStudy", fieldOfStudy);
    formData.append("institution", institution);
    formData.append("graduationYear", graduationYear);
    formData.append("jobTitlesSeeking", jobTitlesSeeking);
    formData.append("remotePreference", remotePreference);
    formData.append("salaryExpectation", salaryExpectation);
    formData.append("preferredLocations", preferredLocations);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    const result = await saveProfile(formData);
    setSaving(false);

    if (result?.success) {
      setSuccessTitle("Profile saved");
      setSuccessMessage("Your profile is now up to date.");
      setShowSuccess(true);
      if (result.completion) {
        setCompletion(result.completion);
      }
      if (result.resumeSaved) {
        setResumeOnFile(true);
        setResumeUrl(null);
        setResumeFile(null);
      }
      successTimer.current = setTimeout(() => setShowSuccess(false), 5000);
    } else {
      setSaveError(result?.error ?? "Failed to save profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <span className="flex h-10 w-10 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </span>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* ─── Navbar ─── */}
      <SiteNavbar
        active="profile"
        onSignOut={handleSignOut}
        signingOut={signingOut}
        showFindJobsNotification
      />

      {/* ─── Success notification banner ─── */}
      {showSuccess && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 rounded-xl border border-success-light bg-success-lightest px-5 py-3 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 8L7 11L12 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-success-foreground">
                {successTitle}
              </p>
              <p className="text-xs text-success-foreground/70">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-success-foreground/50 transition-colors hover:bg-success/20 hover:text-success-foreground"
              aria-label="Dismiss notification"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M11 3L3 11M3 3L11 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─── Profile content ─── */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:px-8">
        <div className="space-y-6">
          {/* ─── Profile needs attention ─── */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    completion?.missing.length
                      ? "bg-error/10 text-error"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {completion?.missing.length ? <AlertIcon /> : <CheckIcon />}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    {completion?.missing.length
                      ? "Profile needs attention"
                      : "Profile complete"}
                  </h2>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-text-secondary">
                    {completion?.missing.length
                      ? "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."
                      : "Every field is filled in — you're all set for tailored matches and quality resume generation."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {completion?.missing.length ? (
                      completion.missing.map((missing) => (
                        <span
                          key={missing}
                          className="rounded-md bg-error/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-error"
                        >
                          {missing}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-md bg-success/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-success">
                        COMPLETE
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ProgressRing value={completion?.percent ?? 0} />
            </div>
          </section>

          {/* ─── Resume ─── */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary">Resume</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Upload an existing resume to auto-fill the profile, or generate a
              new tailored one from your details below.
            </p>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload resume — click to upload or drag and drop a PDF"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragging(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleResumeFile(e.dataTransfer.files[0] ?? null);
              }}
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                dragging
                  ? "border-accent bg-accent-muted"
                  : "border-border bg-surface-secondary hover:border-accent/40 hover:bg-surface-muted"
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-accent shadow-sm">
                <UploadIcon />
              </div>
              <p className="text-sm font-medium text-text-primary">
                {resumeFile
                  ? resumeFile.name
                  : resumeOnFile
                    ? "Resume on file — click to replace"
                    : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {resumeFile
                  ? `PDF · ${formatFileSize(resumeFile.size)} — uploads when you save`
                  : "PDF formatting only. Maximum file size 5MB."}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:shadow-sm"
                >
                  Select Resume
                </button>
                {resumeOnFile && !resumeFile && (
                  <button
                    type="button"
                    onClick={handleViewResume}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={resumeLinkLoading}
                    className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-semibold text-accent shadow-xs transition-all duration-200 hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resumeLinkLoading ? "Preparing…" : "View Resume"}
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleResumeInputChange}
            />

            {/* Extract bar */}
            {(resumeFile || resumeOnFile) && (
              <div className="mt-4">
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-text-secondary">
                    Auto-fill your profile fields from this resume.
                  </p>
                  <button
                    type="button"
                    onClick={handleExtractFromResume}
                    disabled={extracting}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {extracting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                    )}
                    {extracting ? "Extracting…" : "Extract from Resume"}
                  </button>
                </div>
                {extractError && (
                  <p className="mt-3 rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                    {extractError}
                  </p>
                )}
              </div>
            )}

            {/* Generate bar */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">
                Need a fresh document based on the fields below?
              </p>
              <button
                type="button"
                onClick={handleGenerateResume}
                disabled={generating}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                )}
                {generating ? "Generating…" : "Generate Resume from Profile"}
              </button>
            </div>
            {generateError && (
              <p className="mt-3 rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {generateError}
              </p>
            )}
          </section>

          {/* ─── Profile information form ─── */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="text-base font-semibold text-text-primary">Profile Information</h2>
            <p className="mt-1 text-sm text-text-secondary">
              This context is used to accurately represent you in agent
              interactions.
            </p>

            <form className="mt-6" onSubmit={handleSubmit}>
              {/* ── Personal Info ── */}
              <div className="border-t border-border pt-6">
                <SectionHeading>Personal Info</SectionHeading>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" htmlFor="fullName">
                    <TextInput id="fullName" value={fullName} onChange={setFullName} />
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <TextInput id="email" value={email} readOnly />
                  </Field>
                  <Field label="Phone Number" htmlFor="phone">
                    <TextInput id="phone" value={phone} onChange={setPhone} />
                  </Field>
                  <Field label="Location" htmlFor="location">
                    <TextInput id="location" value={location} onChange={setLocation} />
                  </Field>
                  <Field label="LinkedIn URL" htmlFor="linkedinUrl">
                    <TextInput
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={setLinkedinUrl}
                    />
                  </Field>
                  <Field label="Portfolio / GitHub" htmlFor="portfolioUrl">
                    <TextInput
                      id="portfolioUrl"
                      value={portfolioUrl}
                      onChange={setPortfolioUrl}
                    />
                  </Field>
                  <Field label="Work Authorization" htmlFor="workAuthorization" className="sm:col-span-2">
                    <Select
                      id="workAuthorization"
                      value={workAuthorization}
                      onChange={setWorkAuthorization}
                      options={["Citizen", "Permanent Resident", "Visa Required"]}
                    />
                  </Field>
                </div>
              </div>

              {/* ── Professional Info ── */}
              <div className="mt-6 border-t border-border pt-6">
                <SectionHeading>Professional Info</SectionHeading>
                <div className="mt-5 space-y-4">
                  <Field label="Current/Recent Job Title" htmlFor="currentTitle">
                    <TextInput
                      id="currentTitle"
                      value={currentTitle}
                      onChange={setCurrentTitle}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Experience Level" htmlFor="experienceLevel">
                      <Select
                        id="experienceLevel"
                        value={experienceLevel}
                        onChange={setExperienceLevel}
                        options={["Junior", "Mid", "Senior", "Lead"]}
                      />
                    </Field>
                    <Field label="Years of Experience" htmlFor="yearsExperience">
                      <TextInput
                        id="yearsExperience"
                        value={yearsExperience}
                        onChange={setYearsExperience}
                      />
                    </Field>
                  </div>
                  <Field label="Skills" htmlFor="skills">
                    <TagInput
                      id="skills"
                      tags={skills}
                      onChange={setSkills}
                      placeholder="Add a skill"
                    />
                  </Field>
                  <Field label="Industries Worked In (Optional)" htmlFor="industries">
                    <TagInput
                      id="industries"
                      tags={industries}
                      onChange={setIndustries}
                      placeholder="E.g. FinTech, Healthcare"
                    />
                  </Field>
                </div>
              </div>

              {/* ── Work Experience ── */}
              <div className="mt-6 border-t border-border pt-6">
                <SectionHeading
                  right={
                    <button
                      type="button"
                      onClick={() =>
                        setRoles([
                          ...roles,
                          {
                            id: `role-${roleIdCounter.current++}`,
                            company: "",
                            title: "",
                            startDate: "",
                            endDate: "",
                            currentlyWorking: false,
                            responsibilities: "",
                          },
                        ])
                      }
                      className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-dark"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add role
                    </button>
                  }
                >
                  Work Experience
                </SectionHeading>

                <div className="mt-5 space-y-4">
                  {roles.map((role, index) => (
                    <div
                      key={role.id}
                      className="rounded-xl border border-border bg-surface-secondary p-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Company Name"
                          htmlFor={`role-company-${index}`}
                        >
                          <TextInput
                            id={`role-company-${index}`}
                            value={role.company}
                            onChange={(value) => {
                              const next = [...roles];
                              next[index] = { ...role, company: value };
                              setRoles(next);
                            }}
                          />
                        </Field>
                        <Field label="Job Title" htmlFor={`role-title-${index}`}>
                          <TextInput
                            id={`role-title-${index}`}
                            value={role.title}
                            onChange={(value) => {
                              const next = [...roles];
                              next[index] = { ...role, title: value };
                              setRoles(next);
                            }}
                          />
                        </Field>
                        <Field label="Start Date" htmlFor={`role-start-${index}`}>
                          <TextInput
                            id={`role-start-${index}`}
                            value={role.startDate}
                            onChange={(value) => {
                              const next = [...roles];
                              next[index] = { ...role, startDate: value };
                              setRoles(next);
                            }}
                            icon={<CalendarIcon />}
                          />
                        </Field>
                        <Field label="End Date" htmlFor={`role-end-${index}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <TextInput
                              id={`role-end-${index}`}
                              value={role.endDate}
                              onChange={(value) => {
                                const next = [...roles];
                                next[index] = { ...role, endDate: value };
                                setRoles(next);
                              }}
                              placeholder="MM/YYYY - MM/YYYY"
                            />
                            <label
                              htmlFor={`role-current-${index}`}
                              className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-text-secondary"
                            >
                              <input
                                id={`role-current-${index}`}
                                type="checkbox"
                                checked={role.currentlyWorking}
                                onChange={(e) => {
                                  const next = [...roles];
                                  next[index] = {
                                    ...role,
                                    currentlyWorking: e.target.checked,
                                  };
                                  setRoles(next);
                                }}
                                className="h-4 w-4 cursor-pointer rounded border-border accent-accent"
                              />
                              Currently working here
                            </label>
                          </div>
                        </Field>
                      </div>
                      <div className="mt-4">
                        <Field
                          label="Key Responsibilities"
                          htmlFor={`role-responsibilities-${index}`}
                        >
                          <TextArea
                            id={`role-responsibilities-${index}`}
                            value={role.responsibilities}
                            onChange={(value) => {
                              const next = [...roles];
                              next[index] = { ...role, responsibilities: value };
                              setRoles(next);
                            }}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Education ── */}
              <div className="mt-6 border-t border-border pt-6">
                <SectionHeading>Education</SectionHeading>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Highest Degree" htmlFor="degree">
                    <Select
                      id="degree"
                      value={degree}
                      onChange={setDegree}
                      options={[
                        "High School",
                        "Associate Degree",
                        "Bachelor's Degree",
                        "Master's Degree",
                        "PhD",
                      ]}
                    />
                  </Field>
                  <Field label="Field of Study" htmlFor="fieldOfStudy">
                    <TextInput
                      id="fieldOfStudy"
                      value={fieldOfStudy}
                      onChange={setFieldOfStudy}
                    />
                  </Field>
                  <Field label="Institution Name" htmlFor="institution">
                    <TextInput
                      id="institution"
                      value={institution}
                      onChange={setInstitution}
                      placeholder="E.g. State University"
                    />
                  </Field>
                  <Field label="Graduation Year" htmlFor="graduationYear">
                    <TextInput
                      id="graduationYear"
                      value={graduationYear}
                      onChange={setGraduationYear}
                      placeholder="YYYY"
                    />
                  </Field>
                </div>
              </div>

              {/* ── Job Preferences ── */}
              <div className="mt-6 border-t border-border pt-6">
                <SectionHeading>Job Preferences</SectionHeading>
                <div className="mt-5 space-y-4">
                  <Field label="Job Titles Seeking" htmlFor="jobTitlesSeeking">
                    <TextInput
                      id="jobTitlesSeeking"
                      value={jobTitlesSeeking}
                      onChange={setJobTitlesSeeking}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Remote Preference" htmlFor="remotePreference">
                      <Select
                        id="remotePreference"
                        value={remotePreference}
                        onChange={setRemotePreference}
                        options={["Remote", "Onsite", "Hybrid", "Any"]}
                      />
                    </Field>
                    <Field label="Salary Expectation (Optional)" htmlFor="salaryExpectation">
                      <TextInput
                        id="salaryExpectation"
                        value={salaryExpectation}
                        onChange={setSalaryExpectation}
                        placeholder="E.g. $120k+"
                      />
                    </Field>
                  </div>
                  <Field label="Preferred Locations (Optional)" htmlFor="preferredLocations">
                    <TextInput
                      id="preferredLocations"
                      value={preferredLocations}
                      onChange={setPreferredLocations}
                      placeholder="E.g. New York, London"
                    />
                  </Field>
                </div>
              </div>

              {/* ── Save ── */}
              {saveError && (
                <p className="mt-6 rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                  {saveError}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SaveIcon />
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="flex h-10 w-10 items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          </span>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
