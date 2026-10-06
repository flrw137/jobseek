import OpenAI from "openai";
import { Stagehand, type Page } from "@browserbasehq/stagehand";
import { createCompanyResearchSession } from "@/lib/browserbase";
import type {
  HomepageExtraction,
  RawCompanyResearch,
  ResearchDossier,
  SubPageExtraction,
} from "./types";

const PAGE_LINK_PRIORITY: Record<string, number> = {
  about: 0,
  blog: 1,
  engineering: 2,
  product: 3,
  team: 4,
  careers: 5,
  other: 6,
};

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_RESEARCH_MODEL = "openai/gpt-oss-120b";

const MAX_EXTRACT_CHARS = 10000;
const RATE_LIMIT_INTERVAL_MS = 20_000;

let lastLlmCallAt = 0;

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastLlmCallAt;
  const waitMs = RATE_LIMIT_INTERVAL_MS - elapsed;
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastLlmCallAt = Date.now();
}

/* ────────────────────────────────────────────────────────────
   Inputs
   ──────────────────────────────────────────────────────────── */

export interface JobForResearch {
  title: string | null;
  company: string | null;
  about_role: string | null;
  matched_skills: string[];
  missing_skills: string[];
  source_url: string | null;
}

export interface ProfileForResearch {
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    responsibilities?: string;
  }> | null;
}

export interface ResearchResult {
  dossier: ResearchDossier;
  browserSkipped: boolean;
}

/* ────────────────────────────────────────────────────────────
   Sanitizers
   ──────────────────────────────────────────────────────────── */

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown, limit = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, limit);
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

/* ────────────────────────────────────────────────────────────
   Homepage derivation
   ──────────────────────────────────────────────────────────── */

export async function deriveHomepageUrl(
  redirectUrl: string | null,
  company: string | null,
): Promise<string | null> {
  if (redirectUrl) {
    try {
      const response = await fetch(redirectUrl, { redirect: "follow" });
      const finalUrl = response.url;
      if (finalUrl && !finalUrl.includes("adzuna.com")) {
        const derived = stripSubdomain(finalUrl);
        if (derived) return derived;
      }
    } catch {
      // fall through to company-name fallback
    }
  }

  const slug = (company ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^(the|an?)\b/, "");
  if (!slug) return null;

  const candidate = `https://www.${slug}.com`;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function stripSubdomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    const labels = parsed.hostname.split(".");
    if (labels.length > 2) {
      return `https://${labels.slice(1).join(".")}`;
    }
    return `https://${parsed.hostname}`;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────
   Browser extraction
   ──────────────────────────────────────────────────────────── */

const MAX_SUB_PAGES = 3;

const HOMEPAGE_INSTRUCTION = `This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.

Return ONLY valid JSON matching this shape:
{
  "oneLiner": string,
  "productSummary": string,
  "signals": string[],
  "pageLinks": [{ "url": string, "kind": "about" | "careers" | "blog" | "engineering" | "product" | "team" | "other" }]
}

- "oneLiner": what the company does in one sentence.
- "productSummary": what they build/sell and who it's for.
- "signals": funding, notable customers, scale, mission, recent news.
- "pageLinks": at most 8 internal links worth visiting, with absolute https URLs only.`;

const SUB_PAGE_INSTRUCTION = `You are researching a company so a candidate can prepare for an interview. Extract substance from this page: what they do, their values and how they work, the specific technologies and tools they use, and notable projects or customers. Ignore nav, footers, cookie banners, and generic marketing copy.

Return ONLY valid JSON matching this shape:
{
  "keyPoints": string[],
  "technologies": string[],
  "valuesOrCulture": string[],
  "notable": string[]
}`;

async function extractJson(instruction: string, text: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }

  const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
  await waitForRateLimit();
  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || DEFAULT_RESEARCH_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 700,
    messages: [
      {
        role: "system",
        content: "You extract facts from web page text. Return ONLY valid JSON with no commentary.",
      },
      {
        role: "user",
        content: `${instruction}\n\nPAGE TEXT (truncated):\n${text}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("The model returned an empty response.");
  }

  const parsed = parseJsonContent(content);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("The model returned an unexpected response.");
  }
  return parsed as Record<string, unknown>;
}

async function pageInnerText(page: Page, maxChars: number): Promise<string> {
  try {
    const text = await page.evaluate(() => document.body?.innerText ?? "");
    return text
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, maxChars);
  } catch {
    return "";
  }
}

async function extractHomepage(page: Page): Promise<HomepageExtraction | null> {
  try {
    const text = await pageInnerText(page, MAX_EXTRACT_CHARS);
    if (!text) return null;
    const raw = await extractJson(HOMEPAGE_INSTRUCTION, text);
    return {
      oneLiner: asString(raw.oneLiner),
      productSummary: asString(raw.productSummary),
      signals: asStringArray(raw.signals),
      pageLinks: Array.isArray(raw.pageLinks)
        ? (raw.pageLinks as Array<Record<string, unknown>>)
            .map((link) => ({
              url: asString(link.url),
              kind: asString(link.kind),
            }))
            .filter((link) => /^https?:\/\//.test(link.url))
        : [],
    };
  } catch (e) {
    console.warn(
      `research: homepage extraction failed: ${e instanceof Error ? e.message : e}`,
    );
    return null;
  }
}

async function extractSubPage(page: Page, url: string): Promise<SubPageExtraction | null> {
  try {
    await page.goto(url, { timeoutMs: 30000, waitUntil: "domcontentloaded" });
    const text = await pageInnerText(page, MAX_EXTRACT_CHARS);
    if (!text) return null;
    const raw = await extractJson(SUB_PAGE_INSTRUCTION, text);
    return {
      url,
      keyPoints: asStringArray(raw.keyPoints),
      technologies: asStringArray(raw.technologies),
      valuesOrCulture: asStringArray(raw.valuesOrCulture),
      notable: asStringArray(raw.notable),
    };
  } catch (e) {
    console.warn(
      `research: sub-page extraction failed (${url}): ${e instanceof Error ? e.message : e}`,
    );
    return null;
  }
}

export async function browseCompany(
  stagehand: Stagehand,
  homepageUrl: string,
): Promise<RawCompanyResearch | null> {
  const page = stagehand.context.activePage() ?? stagehand.context.pages()[0];
  if (!page) return null;

  try {
    await page.goto(homepageUrl, { timeoutMs: 30000, waitUntil: "domcontentloaded" });
  } catch (e) {
    console.warn(
      `research: failed to load homepage (${homepageUrl}): ${e instanceof Error ? e.message : e}`,
    );
    return null;
  }

  const homepage = await extractHomepage(page);
  if (!homepage || (!homepage.oneLiner && !homepage.productSummary)) {
    return null;
  }

  const sources = [homepageUrl];

  const links = [...homepage.pageLinks]
    .sort((a, b) => (PAGE_LINK_PRIORITY[a.kind] ?? 99) - (PAGE_LINK_PRIORITY[b.kind] ?? 99))
    .slice(0, MAX_SUB_PAGES);

  const subPages: SubPageExtraction[] = [];
  for (const link of links) {
    const extracted = await extractSubPage(page, link.url);
    if (extracted) {
      subPages.push(extracted);
      sources.push(link.url);
    }
  }

  return { homepage, subPages, sources };
}

/* ────────────────────────────────────────────────────────────
   GPT-4o synthesis
   ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

function buildUserPrompt(
  companyResearch: RawCompanyResearch | null,
  job: JobForResearch,
  profile: ProfileForResearch,
): string {
  const researchBlock = companyResearch
    ? {
        homepage: {
          oneLiner: companyResearch.homepage?.oneLiner ?? "",
          productSummary: companyResearch.homepage?.productSummary ?? "",
          signals: companyResearch.homepage?.signals ?? [],
        },
        subPages: companyResearch.subPages.map((sub) => ({
          url: sub.url,
          keyPoints: sub.keyPoints,
          technologies: sub.technologies,
          valuesOrCulture: sub.valuesOrCulture,
          notable: sub.notable,
        })),
      }
    : null;

  const matched = (job.matched_skills ?? []).filter(Boolean).join(", ");
  const missing = (job.missing_skills ?? []).filter(Boolean).join(", ");

  return `COMPANY RESEARCH (from their website):
${researchBlock ? JSON.stringify(researchBlock, null, 2) : "(No browser research was collected — build the briefing from the job posting and the candidate profile alone, and mark any company claims as inferred.)"}

JOB POSTING:
Title: ${job.title ?? "Untitled"}
Company: ${job.company ?? "Unknown company"}
Description: ${job.about_role ?? "(No description available)"}
Matched skills (already computed): ${matched || "(none)"}
Missing skills (already computed): ${missing || "(none)"}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "(not set)"}
Experience: ${profile.years_experience ?? "?"} years, level ${profile.experience_level ?? "?"}
Skills: ${(profile.skills ?? []).filter(Boolean).join(", ") || "(none listed)"}
Work history: ${JSON.stringify(profile.work_experience ?? [])}`;
}

export async function synthesizeDossier(
  companyResearch: RawCompanyResearch | null,
  job: JobForResearch,
  profile: ProfileForResearch,
): Promise<ResearchDossier> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }

  const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
  await waitForRateLimit();
  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || DEFAULT_RESEARCH_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 1200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(companyResearch, job, profile) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("The model returned an empty response.");
  }

  const parsed = parseJsonContent(content);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("The model returned an unexpected response.");
  }
  const raw = parsed as Record<string, unknown>;

  const sources = asStringArray(raw.sources);
  if (sources.length === 0 && companyResearch) {
    sources.push(...companyResearch.sources);
  }

  return {
    companyOverview: asString(raw.companyOverview),
    techStack: asStringArray(raw.techStack),
    culture: asStringArray(raw.culture),
    whyThisRole: asString(raw.whyThisRole),
    yourEdge: asStringArray(raw.yourEdge),
    gapsToAddress: asStringArray(raw.gapsToAddress),
    smartQuestions: asStringArray(raw.smartQuestions),
    interviewPrep: asStringArray(raw.interviewPrep),
    sources,
  };
}

/* ────────────────────────────────────────────────────────────
   Orchestrator
   ──────────────────────────────────────────────────────────── */

export async function researchCompany(
  job: JobForResearch,
  profile: ProfileForResearch,
): Promise<ResearchResult> {
  const homepageUrl = await deriveHomepageUrl(job.source_url, job.company);
  if (!homepageUrl) {
    return {
      dossier: await synthesizeDossier(null, job, profile),
      browserSkipped: true,
    };
  }

  let companyResearch: RawCompanyResearch | null = null;
  let stagehand: Stagehand | undefined;

  try {
    const sessionId = await createCompanyResearchSession();
      const rawModel = process.env.GROQ_MODEL || DEFAULT_RESEARCH_MODEL;
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        browserbaseSessionID: sessionId,
        model: {
          modelName: rawModel.startsWith("groq/") ? rawModel : `groq/${rawModel}`,
          apiKey: process.env.GROQ_API_KEY,
          baseURL: GROQ_BASE_URL,
        },
        disableAPI: true,
        disablePino: true,
      verbose: 0,
      domSettleTimeout: 1500,
    });

    await stagehand.init();
    companyResearch = await browseCompany(stagehand, homepageUrl);
  } catch (error) {
    console.warn(
      `research: browser research failed for "${job.company}" (${homepageUrl}):`,
      error instanceof Error ? error.message : error,
    );
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch {
        // session may already be gone; nothing left to clean up
      }
    }
  }

  return {
    dossier: await synthesizeDossier(companyResearch, job, profile),
    browserSkipped: companyResearch === null,
  };
}
