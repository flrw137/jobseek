# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 5 — Dashboard
**Last completed:** 14 Dashboard Page — Full UI
**Next:** 15 Stats Bar — Real Data

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage — Rebuilt with exact design from landing-page.png:
  - Hero: "Job hunting is hard. Your tools shouldn't be." headline, 2 CTAs
  - Dashboard preview card with 3 job listings (Vercel, Stripe, Linear)
  - "Manage Your Job Search" section with 3 features + job table visual
  - "Apply With More Confidence" section with agent_log terminal visual + 3 features
  - Tom Wilson testimonial with 5-star rating
  - CTA section: "Your next job search can feel a lot less overwhelming."
  - Footer: Jobseek logo, Dashboard / Privacy Policy / Terms & Conditions links
- [x] 02 Auth — InsForge Google + GitHub OAuth:
  - `lib/insforge-client.ts` — browser client via `createBrowserClient`
  - `lib/insforge-server.ts` — server client via `createServerClient({ cookies })`
  - `actions/auth.ts` — `initiateOAuth` server action via `createAuthActions()`
  - `app/(auth)/login/page.tsx` — login page with Google + GitHub buttons
  - `app/api/auth/callback/route.ts` — OAuth code exchange + httpOnly session cookies
  - `app/api/auth/refresh/route.ts` — `createRefreshAuthRouter()`
  - `app/api/auth/signout/route.ts` — `createAuthActions()` sign out
  - `proxy.ts` — session check + redirect for protected routes (Next.js 16 Proxy convention)
  - `.env.local` — configured with InsForge URL + ANON_KEY
- [x] 03 PostHog Initialization:
  - Client init via PostHog wizard: `instrumentation-client.ts` (auto-loaded by Next.js) with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` + `NEXT_PUBLIC_POSTHOG_HOST`
  - `lib/posthog-server.ts` — server client via `createPostHogServer()` with `flushAt: 1`, `flushInterval: 0`
  - `posthog.identify(userId)` after login on dashboard/profile/find-jobs; `posthog.reset()` on sign-out
  - PostHog connected via `npx @insforge/cli posthog setup` (project 489738)
- [x] 04 Database Schema:
  - 4 migrations applied: `create-initial-schema` (profiles), `create-agent-tables` (agent_runs, jobs, agent_logs), `add-row-level-security` (16 owner policies), `add-storage-rls` (owner-only `resumes` bucket)
  - `resumes` bucket created private; verified 62 columns match architecture 1:1

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI:
  - `app/profile/page.tsx` rebuilt to match `context/design/profile.png` exactly
  - Attention card with 70% completion ring + PHONE/LOCATION/EDUCATION badges
  - Connected Accounts card (LinkedIn, Connect LinkedIn button)
  - Resume card — drag-drop zone (PDF/5MB) + Generate Resume from Profile bar
  - Complete profile form: Personal, Professional, Work Experience (+Add role), Education, Job Preferences
  - Mock data pre-filled; no save logic yet (Feature 06)
  - Navbar updated: icons on Dashboard/Find Jobs/Profile, active purple underline, Find Jobs dot, sign-out icon button
- [x] 06 Profile Save Logic:
  - `actions/profile.ts` — `saveProfile(formData)` server action: reads the whole form from FormData, normalizes enum casing (`experience_level`/`remote_preference` lowercase, `work_authorization` snake_case), parses `years_experience` int, splits comma lists, maps roles → `work_experience` jsonb + degree fields → `education` jsonb, computes `is_complete`, upserts into `profiles` via `.upsert(..., { onConflict: 'id' })`, `revalidatePath('/profile')`; plus `getProfile()` server action (`select * ... eq id .maybeSingle()`)
  - Resume upload: file captured in the drop zone (hidden `<input type=file>` + click + drag/drop, PDF + ≤5MB client+server validation), sent through the save action via FormData, uploaded to `resumes/{userId}/resume.pdf` (PUT-replace semantics), `resume_pdf_url` persisted as an on-file marker
  - "View Resume" button when a resume is on file: `getResumeUrl()` server action mints a fresh signed URL via `storage.from("resumes").createSignedUrl("{userId}/resume.pdf", 3600)` and opens it in a new tab. Required because the `resumes` bucket is private (owner-only RLS) — the `getPublicUrl()` value stored in `resume_pdf_url` does not resolve. Signed URLs are minted on demand from the session user id, so previously uploaded rows work too; `stopPropagation`/`onKeyDown` stop the button from falling through to the file picker
  - Form pre-fills from the saved profile on load (was hardcoded mock "Faizan Ali" data); email read-only from auth session
  - Attention card is now dynamic: badges + `ProgressRing` % derived from `lib/profile-completion.ts` (shared pure function, 12 required fields); shows COMPLETE when 100%; at 100% the icon swaps from alert to a green check and the copy changes to a success message ("Every field is filled in…")
  - Success banner now reused for sign-in AND save ("Profile saved"); inline error alert shown on save failures; Save button shows spinner while saving
  - Verified: `tsc`, `eslint`, `next build` pass; SDK round-trip (upsert-by-id, upload/replace, public URL, select) tested against the live backend with a temp user, cleaned up after
- [x] 07 AI Profile Extraction from Resume:
  - `lib/pdf-extract.ts` — `extractPdfText(buffer)` via `pdfjs-dist` legacy build; static-imports the worker and sets `globalThis.pdfjsWorker` so pdfjs uses the main-thread fake worker (Turbopack can't resolve pdfjs's dynamic `import(pdf.worker.mjs)` — without this the server throws "Setting up fake worker failed"); `types/pdfjs-worker.d.ts` declares the worker module
  - `agent/types.ts` — `ExtractedProfile` / `ExtractedWorkExperience` / `ExtractedEducation` interfaces
  - `agent/extractor.ts` — Groq structured extraction (OpenAI-compatible `https://api.groq.com/openai/v1`, `openai` SDK v7, temperature 0.2, `response_format: json_object`): enum constants matching the UI labels, sanitizers (`asString/asStringArray/asNumber/asBool/asOption/asWorkExperience/asEducation`), `normalizeExtraction`, resilient `parseJsonContent` (direct / fenced-block / brace-slice), `SYSTEM_PROMPT`; `extractProfileFromResume(text)` throws if `GROQ_API_KEY` missing; default model `openai/gpt-oss-120b` (Groq does NOT host `gpt-4o` — verified via web), override with `GROQ_MODEL` (alternatives `openai/gpt-oss-20b`, `llama-3.3-70b-versatile`)
  - `app/api/resume/extract/route.ts` — POST; `getCurrentUser()` → 401; `request.formData()` wrapped in `.catch()` → 400 "Invalid request body." (a bodyless POST used to 500); file branch (PDF + ≤5MB) else storage `download("{userId}/resume.pdf")` → 400 "No resume found to extract."; unreadable PDF → 422 "Could not read this PDF file."; text < 100 chars → 422; provider failure → 502; success `{ data: profile }`
  - `app/profile/page.tsx` — "Extract from Resume" bar (visible when a file is selected or on file): spinner, inline error, success banner; `applyExtraction()` merges ONLY fields the resume provides into the form (re-clamps enums to UI labels, rebuilds role ids, recomputes completion), existing values are never wiped
  - `.env.local` — `GROQ_API_KEY` added (user-supplied); verified working end-to-end
  - Verified: `tsc`, `eslint`, `next build` pass; live E2E test (temp user → sign-in → upload on-file PDF → real HTTP calls with session cookies): on-file download branch 200 (full profile), new-file branch 200 (2 roles), invalid PDF 422, unauthenticated 401
  - Two runtime bugs found & fixed during verification: pdfjs fake-worker chunk resolution (above) and `request.formData()` throwing on non-form bodies
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI:
  - `app/find-jobs/page.tsx` rebuilt to match `context/design/find-jobs.png` exactly
  - Search card: JOB TITLE + LOCATION inputs (mock values "Frontend Engineer" / "Remote, New York...") + purple Find Jobs button (no-op until Feature 10); green banner "Found 8 jobs and saved 4 strong matches."
  - Filter bar: "Filter by company or role..." search input + All Matches / sort dropdowns
  - Results table (6 columns): company letter avatar, role, match-score progress bar (green ≥90 / blue 80-89 / orange <80), salary, date found; 6 rows match the design exactly
  - Live client-side behavior over a 24-row mock dataset: filter by company/role, match band (80%+/90%+), sort (date/score/company), pagination 6/page with Previous/Next + numbered pages
  - Footer: "Showing X to Y of Z results" + empty state when no rows match
  - Navbar: Find Jobs active with purple underline (icons on all 3 links, sign-out icon button preserved)
- [x] 10 Adzuna Job Discovery:
  - `lib/utils.ts` — `MATCH_THRESHOLD = 70` (shared constant per library-docs)
  - `lib/adzuna.ts` — `searchJobs(jobTitle, location, country="us")`: `category=it-jobs` always, `where` omitted when location empty, returns typed `AdzunaJob[]`, throws on non-OK / missing `ADZUNA_APP_ID`/`ADZUNA_APP_KEY`
  - `agent/matcher.ts` — `scoreJobs(profile, jobs)`: ONE batched Groq call (`GROQ_API_KEY`, `openai/gpt-oss-120b`, temp 0.3, `response_format: json_object`, max_tokens 2048) returning `{ [jobId]: { matchScore, matchReason, matchedSkills, missingSkills } }`; sanitizers clamp score 0-100, dedupe skill arrays, resilient `parseJsonContent`
  - `agent/adzuna.ts` — `discoverJobs(profile, jobTitle, location)`: search → batch-score → filter `>= MATCH_THRESHOLD` → map to `jobs`-table records (`source: "search"`, salary `$Xk - $Yk`, `job_type` = contract_type || "fulltime", `about_role` = snippet, both URLs = `redirect_url`); returns `{ found, saved }`
  - `app/api/agent/find/route.ts` — POST `{ jobTitle, location }`; 401 unauth, 400 invalid body / missing title, 422 no saved profile, 502 Adzuna/Groq/network failure, 500 on agent_runs/jobs insert error; creates one `agent_runs` row per search (`status: completed`, `job_title_searched`, `location_searched`, `jobs_found`), dedupes inserts on `(user_id, source_url)` (keeps first), returns `{ jobs, found, saved }`
  - `app/find-jobs/page.tsx` — search card wired to the route (spinner button, inline error); results state replaces `MOCK_JOBS` after a search; returned rows mapped to the table shape (`role ← title`, `score ← match_score`, `salary` fallback "—", relative date label + sortable hours from `found_at`); banner shows real `{ found, saved }`; mock dataset stays as the pre-search fallback; filter/sort/pagination untouched
  - Verified: `eslint` + `next build` green; live E2E with real keys: signed-in search → 200, found 10 / saved 5 above threshold, rows persisted. 401 unauth + 502 no-keys paths smoke-tested.
  - Post-verification fixes: `.env.local` had `ADZUNA_API_KEY` but code reads `ADZUNA_APP_KEY` (renamed; vars documented in `.env.example`); `searchJobs` now normalizes the location (`Remote, X` → `X`, bare `Remote` → no `where`) because Adzuna's `where` must be a geocodable place; `job_type` mapped from Adzuna contract types (`permanent → fulltime`, `part_time → parttime`, `temporary → contract`) to satisfy the CHECK constraint; find-jobs page defaults location to empty and distinguishes "no jobs found" vs "no matches" vs "filters emptied the list" in the empty state
  - Show-all-matches change: `discoverJobs` now returns ALL scored jobs (`saved`) plus a `strong` (≥70) subset; the route persists only `strong` but responds with every scored job, so the table shows low matches too; page gained a "Low Matches (<70%)" band and "High Matches First" / "Low Matches First" sorts (grouped ≥70 / <70, score-desc within each); banner counts `saved` = persisted strong matches. E2E: found 10, returned 10 (incl. 20-30% scores), persisted 5
  - Max-results change: `results_per_page` 10 → 50 (Adzuna's max per request). `agent/matcher.ts` now scores jobs in sequential batches of 15 (`max_tokens` 4096) because one call for 50 jobs truncated the JSON; parallel batches hit Groq free-tier 8000 TPM → 429, so they run sequentially; job descriptions truncated to ~500 chars before scoring to shrink the prompt. Tradeoff: a 50-job search takes ~2 min (spinner shows). E2E: found 50, returned 50 (scores 10-80), persisted 5. Low (<70%) scores for most jobs reflect the strict seniority prompt + profile, not a display bug — table shows every scored job
  - Cap change (Aug 8): `results_per_page` 50 → **25** in `lib/adzuna.ts` (user request — fewer results, faster searches; sequential scoring of 25 jobs ≈ half the old ~2 min).
- [x] 11 Filter + Sort + Pagination (real DB data):
  - `actions/jobs.ts` — `getSavedJobs()` server action: session check → `select id, title, company, salary, match_score, found_at` from `jobs` `eq user_id` `order found_at desc`; returns `{ jobs, error }` with empty-string fallbacks for null title/company
  - `app/find-jobs/page.tsx` — on auth success the page loads the user's saved jobs from the DB (`getSavedJobs()`) and renders them; `MOCK_JOBS` dataset removed (real data replaces the pre-search fallback); initial state is `[]`
  - Summary banner now renders only after a search (`summary` set) — the mock "Found 8 jobs and saved 4 strong matches." fallback text is gone
  - Empty state gained a fourth case: no saved jobs yet → "No saved jobs yet / Run a search above to find and save your matches."
  - Sort gained "Oldest First" (found_at ascending); filter bands (All / Strong 80%+ / Great 90%+ / Low <70%), text search (company or role, case-insensitive), and 6/page pagination with total count unchanged
  - Post-search behavior unchanged: a search response still shows ALL scored jobs (incl. low matches) in-session; a reload shows the persisted strong matches from the DB
  - Verified: `eslint` + `next build` green
- [x] Proxy auth refresh — live-verified + hardened (see also Feature 10 fixes):
  - Root cause of the 401-after-search bug confirmed: InsForge access tokens expire after ~15 min, and server-mode `getCurrentUser()` never auto-refreshes. The proxy now refreshes on `/api/agent` + `/api/resume` requests.
  - Next.js Proxy does NOT propagate middleware `request.cookies` mutations to the route handler (confirmed empirically: the route saw the stale token even when `updateSession` refreshed). Fix: the proxy passes the (possibly refreshed) access token as an `x-insforge-access-token` request header (`NextResponse.next({ request: { headers } })`), and `lib/insforge-server.ts` reads it via `next/headers headers()` and passes it as `accessToken` to `createServerClient` (`createServerClient` accepts a token override). Response cookies from `updateSession` are captured on a placeholder `NextResponse` and copied onto the real response. Client-spoofing the header is impossible because the proxy overwrites it from `updateSession`'s token.
  - Live E2E (fresh signed-up user, OTP verified via mailinator inbox, direct fetch to `/api/auth/sessions?client_type=mobile` to capture the refresh token the SDK strips from its public response): no-auth → 401 JSON (not redirect); valid token → authed (400 on bodyless `/api/resume/extract`); expired-access + valid-refresh → **same request** now authed (400) + 2 Set-Cookie; full search through the proxy with the refreshed session → 200, found 50, saved 7. (Full-search re-run hit Groq's 200k tokens/day free cap — provider quota, not a code issue.)
  - `eslint` + `next build` green.

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI:
  - `app/jobs/[jobId]/page.tsx` — Client Component with `useParams()`, consistent navbar (Find Jobs active), auth gate via `getSessionUser()` → redirect to `/login`, PostHog identify
  - `actions/jobs.ts` — `getJob(jobId)` server action: session check → `select *` from `jobs` `eq id` + `eq user_id` `.maybeSingle()`; normalizes array fields (responsibilities/requirements/nice_to_have/benefits/matched_skills/missing_skills) with `.filter(Boolean)`; returns `{ job, error }`
  - UI (per spec): Back to Jobs link; job header card with company initial avatar, title, company, match-score badge (% colored by score band: ≥90 success-lightest/success, 70–89 success-light/success, 50–69 warning/warning-foreground, else surface-secondary), View Job Post + Apply Now buttons (both link to `external_apply_url ?? source_url`, new tab); 4 info cards (Salary Est., Location, Job Type via `fulltime→Full-time` map, Date Found relative); AI Match Reasoning section with score bar + `match_reason`; Required Skills vs Your Profile (matched = green `bg-success-lightest` + check, missing = `bg-accent-muted` + cross); Job Description section (`about_role` + optional Responsibilities/Requirements/Nice to Have/Benefits/About the Company bullet lists, hidden when empty); Company Research card with empty state + disabled "Research Company" button (Feature 13 wires it); error card with Back to Jobs when job not found/load fails
  - `app/api/agent/find/route.ts` — search response now returns the persisted DB `id` (uuid) for jobs that were saved (via `id, source_url` map) so the list can deep-link; non-persisted jobs keep `source_url` as id
  - `app/find-jobs/page.tsx` — company name + role cells are `Link`s to `/jobs/{id}` when the id is a uuid (`isSavedJobId` regex); non-persisted rows stay plain text
  - Verified: `eslint` + `next build` green (route `/jobs/[jobId]` registered); live data check with the persisted test user (7 jobs): `getJob` query returns full row (title, company, location, salary `$155k`, job_type fulltime, match_score 85, match_reason, matched_skills `[React, Next.js, TypeScript]`, about_role, external_apply_url); `/jobs/{uuid}` page returns 200 through the dev server with a session
- [x] 13 Company Research Agent:
  - `app/api/agent/research/route.ts` — POST `{ jobId }`: session gate (401), validates body (400), loads job scoped to user (500 / 404), loads profile (500 / 422), runs `researchCompany`, persists dossier to `jobs.company_research`, captures PostHog `company_researched` (+ `shutdown()`), returns `{ dossier, browserSkipped }` (502 on LLM failure)
  - `agent/research.ts` — Groq-only (no OpenAI): `deriveHomepageUrl` (follows `source_url` redirects, falls back to `www.{slug}.com`), `browseCompany` (Browserbase + Stagehand v3.7.1, `disableAPI`, `domcontentloaded`; homepage JSON extraction + up to 3 prioritized sub-pages), `synthesizeDossier` (gpt-oss-120b, JSON mode, `max_tokens` 1200 — 800 truncates). Module-level 20s rate-limit spacer between LLM calls. Failure observability: extraction failures now `console.warn` (were silent nulls → misleading `browserSkipped: true`)
  - `lib/browserbase.ts` — `createCompanyResearchSession()` mints a session from `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID`
  - Verified: `eslint` + `tsc` green. Live route E2E (fresh throwaway user via mail.tm, real Stripe job row): no-auth 401, authed + bogus UUID 404, authed + real job 200 with full dossier (techStack incl. "Kubernetes (missing)", gapsToAddress, sources). Browser leg confirmed working in-route via staged debug log (page acquired, goto OK, 11k-char innerText, Browserbase session created) — the live run's `browserSkipped: true` was Groq free-tier 200k TPD daily cap (429 at 198,785 used), which `extractHomepage` swallowed as null; standalone browser smoke produced a full Stripe homepage extraction. A clean `browserSkipped: false` route re-run is pending Groq quota reset

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI:
  - `app/dashboard/page.tsx` rebuilt to match `context/design/dashboard.png` exactly
  - Navbar: Dashboard active with purple underline + icons on all 3 links (grid/search/user), sign-out icon button preserved
  - Row 1 — 4 stat cards (mock): Total Jobs Found 284 (+12% vs last week green pill), Avg. Match Rate 82% (+3% vs last week), Companies Researched 35 ("Total researched"), Jobs This Week 28 ("New this week"); hover shadow micro-interaction
  - Row 2 — Recent Activity timeline (5 entries, colored dots per design: purple accent / blue info / green success, ring-2 ring-surface on 16px outer, vertical bg-border spine) + Company Research Activity bar chart (Mon–Sun, blue `fill-info`, Y ticks 0/3/6/9/12, bars Mon 3 / Tue 5 / Wed 4 / Thu 8 / Fri 12 / Sat 4 / Sun 1)
  - Row 3 — Jobs Found Over Time area chart (purple `stroke-accent` 3px, smooth quadratic path, `--color-accent` 0.22→0 gradient fill, Y ticks 0/25/50/75/100 dashed gridlines) + Match Score Distribution bar chart (green `fill-success`, buckets 50-60%→90-100% with heights 5/12/45/80/40)
  - Charts are inline SVG (no recharts yet — spec defers recharts to Feature 17); shared `ChartGrid`/`BarChart`/`AreaLineChart`/`smoothPath` helpers; all chart colors + activity dots + trend badges use design tokens only (`fill-info`, `fill-success`, `stroke-accent`, `stroke-border`, `fill-text-muted` for axis labels)
  - Auth gate, PostHog identify, loading spinner, sign-out handler all preserved from prior page
  - Note: design image shows "Company Research Activity" (spec text said "Resume Tailoring Activity") and "Jobs This Week" as 4th stat (spec said "Cover Letters Generated") — followed the design image, and Feature 15's real-data spec confirms "Jobs This Week"
- [x] 15 Stats Bar — Real Data:
  - `actions/jobs.ts` — `getDashboardStats()` server action: session gate → 3 InsForge queries per user (`select id head:true count:exact` for total jobs and company_research-not-null; `select match_score, found_at` for avg/trends). Computes avg match rate, jobs this week (last 7d), and week-over-week trends: `totalJobsTrend` = pct change of this-week vs prev-week job counts, `avgMatchRateTrend` = point delta of weekly averages (both null when no prev-week basis)
  - `app/dashboard/page.tsx` — mock `STATS` array removed; the 4 stat cards now render `getDashboardStats` values with `—` placeholder while loading and `Could not load stats` on error; trend pills are real (green positive / warning negative), falling back to sub-labels when no trend basis; Cards 3-4 keep their "Total researched" / "New this week" sub-labels
  - Verified: `eslint` + `tsc` + `next build` green. Live DB check with a fresh authed throwaway user + 6 inserted job rows (varied match_score 60-100, found_at spread over this week/prev week/30d, 2 with `company_research`): total 7, researched 2, avg 82, this week 4, prev week 2 → trend +100% (jobs) / +22pts (match) — query shapes confirmed against the real PostgREST backend
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- Homepage is a single Client Component with all markup inline (no component extraction yet). This can be refactored into components/homepage/ later.
- Used inline SVGs instead of external images since public/ directory doesn't exist
- All design tokens used — no hardcoded hex values
- Auth uses InsForge SSR SDK (`@insforge/sdk/ssr`) with `createBrowserClient`, `createServerClient`, `createAuthActions`, `createRefreshAuthRouter`, and `updateSession` middleware
- Auth mutations run server-side via `createAuthActions()` — never from Client Components
- OAuth uses `skipBrowserRedirect: true` with the PKCE `codeVerifier` stored in an httpOnly `insforge_code_verifier` cookie (10 min TTL), exchanged in `app/api/auth/callback/route.ts`
- `redirectTo` for OAuth points at `/api/auth/callback` (Route Handler), which redirects to `/dashboard` after exchange
- `proxy.ts` uses a small `createCookieStoreAdapter()` to bridge Next.js `RequestCookies`/`ResponseCookies` and the SDK's `CookieStore` (avoids `as any` casts); `updateSession` is imported from `@insforge/sdk/ssr/middleware`
- `turbopack.root` set in `next.config.ts` to silence the workspace-root lockfile warning
- Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts` — project uses `proxy.ts`
- PostHog connected to the InsForge dashboard via `npx @insforge/cli posthog setup` (interactive browser OAuth). Client-side init uses the official PostHog wizard setup (`instrumentation-client.ts` at project root, auto-loaded by Next.js) with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` + `NEXT_PUBLIC_POSTHOG_HOST`. Server events use `createPostHogServer()` and must call `await posthog.shutdown()` after `capture`.
- Profile page (Feature 05) is a single Client Component with mock data in `useState` — form controls are live (tags add/remove, roles add, checkbox, drag highlight) but Save Profile is a no-op `preventDefault` until Feature 06.
- Email field is read-only on the profile form (pre-filled from auth).
- Profile navbar: nav links now have icons + active underline indicator; sign-out moved to a small icon button in the navbar (was a full row on the profile page).
- Profile form (Feature 06) keeps the empty-form fallbacks on `Select`s ("Junior", "Any", "Citizen", "High School") as UI defaults, but a fresh user's attention card is computed from the DB row (all fields missing) — the real save writes lowercase enum values.
- `@insforge/sdk` database is built on `@supabase/postgrest-js`, so `.upsert([{...}], { onConflict: 'id' })`, `.maybeSingle()`, `.eq()` all work; storage `upload(path, file)` has PUT-replace semantics (re-uploading `resumes/{userId}/resume.pdf` replaces the old file) — no schema migration needed for the resume key.
- The `resumes` bucket is private (owner-only RLS), so `getPublicUrl()` is not usable for viewing — always mint a signed URL (`createSignedUrl`) server-side on demand. `resume_pdf_url` is only used as a boolean on-file marker.
- A long-lived Windows dev-server process accumulates stale undici connection/DNS/TLS state: after ~12h the SDK's `fetch` intermittently throws `TypeError: fetch failed`, surfaced as "Network request failed: fetch failed" from `initiateOAuth` (`actions/auth.ts:25`). Fix: kill the `next dev` process tree (`taskkill /PID <next-cli-pid> /T /F`) and restart. The dev server is now run backgrounded with logs at `C:\Users\freid\AppData\Local\Temp\opencode\next-dev.log`.
- Next.js app-router directories prefixed with `_` are PRIVATE folders and are not routed — a temporary verify route at `app/api/__verify-extract/` 404'd until renamed to `verify-extract`.
- Feature 07 model: Groq free tier does not host `gpt-4o`; chose `openai/gpt-oss-120b` as the default extraction model (open-weight, strong JSON). `years_experience` inference is model-variance-y (returned 0 in one run, 10 in another for the same 2016→present resume) — acceptable since the user reviews filled fields before saving.
- `agent/extractor.ts` + `lib/pdf-extract.ts` are importable in plain Node under `tsx` (no `@insforge` deps), which enabled fast standalone testing before the live E2E pass.
- InsForge backend notes for the verify harness: admin `auth.signUp({ autoConfirm: true })` does NOT return a session — call `auth.signInWithPassword` afterwards; the returned `AuthSession` includes `user.id`; `auth.signUp` response is `{ accessToken, requireEmailVerification }` (no `user` field).

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

- **UI polish + rebrand (Aug 8)**: centered shared navbars, mobile glass sidebar, blue rebrand, JobPilot → Jobseek rename.
  - New shared `SiteNavbar` (`components/site-navbar.tsx`) replaces the per-page inline navbars on dashboard / find-jobs / profile / jobs/[jobId]; props `{ active, onSignOut, signingOut?, showFindJobsNotification? }`. Centered links via `grid grid-cols-[1fr_auto_1fr]` (logo col 1, links col 2, sign-out col 3); pages no longer define nav icons.
  - `NavAuth` (`components/nav-auth.tsx`) now renders the full homepage navbar (logo + centered links + accent CTA or logged-in actions); homepage markup is just `<NavAuth user={user} />`. Login page keeps its own inline centered grid nav.
  - `MobileNav` is a fixed right-side glass slide-in sidebar (`inset-y-0 right-0 w-72`, `bg-surface/90 backdrop-blur-xl border-l border-border`, `translate-x` transition, backdrop, Escape, body scroll lock). Rendered inside `SiteNavbar`/`NavAuth` below `md`.
  - Accent tokens themed to professional blue: `--color-accent: #2563eb`, `--color-accent-dark: #1d4ed8`, `--color-accent-light: #dbeafe`, `--color-accent-muted: #eff6ff`; `success` family (#10b981) intentionally kept green for match-score data. All components use tokens — no component-level hex edits.
  - Hero polish on homepage: ambient blurred glows (accent-muted / success-lightest / info-lightest), primary CTAs now `bg-accent hover:bg-accent-dark` (were `bg-text-primary`), preview card halo + refined shadow.
  - Brand rename JobPilot → Jobseek: all copy (homepage features/terminal/testimonial/footer, login page, `app/layout.tsx` metadata title), brand text in `SiteNavbar`/`MobileNav`/`NavAuth`, `instrumentation-client.ts` comment, and `context/*.md` docs. No code identifiers or route names changed.
  - Verified: `eslint` + `tsc` + `next build` green; impeccable detector ran clean.
- **Mobile nav fixes (Aug 8)**: right-side actions in `NavAuth` / `SiteNavbar` / login nav now carry `col-start-3` — with the centered links column `hidden` below `md`, CSS grid auto-placement dropped the CTA / hamburger / sign-out into the center column (why "Start for free" sat next to the logo and the hamburger was centered). Pinning to col 3 restores the right corner. `MobileNav` swapped the green gradient (`from-accent via-accent-dark to-success-dark`) for translucent glass (`bg-surface/90 backdrop-blur-xl border-l border-border`) with dark text + `bg-accent-muted` active pill — the gradient clashed with the blue accent and the user wanted a translucent backdrop instead. Root cause of "color changes invisible": stale dev CSS — `.next/dev/static/chunks/app_globals_css_1igg3k2._.single.css` still held `--color-accent: #7c5cfc` (violet); fixed by killing the `next dev` process (`Stop-Process`) and relaunching, which regenerated the chunk with `#2563eb`. Re-verified: `eslint` + `tsc` green; CSS chunk on disk now emits `--color-accent: #2563eb`.
- **MobileNav fixed-positioning bug (Aug 8, follow-up)**: the backdrop + slide-in panel were `position: fixed` but rendered inside the sticky `<nav>` which has `backdrop-blur-xl`. `backdrop-filter` on an ancestor creates a containing block for `fixed` descendants, so the panel sized to the navbar box instead of the viewport: `inset-y-0` → ~73px tall, and with `overflow-hidden` the Dashboard/Find Jobs/Profile/Sign-out items were clipped (user: "can't see any of the sections"); closed `translate-x-full` sat just off the navbar's right edge inside the scroll area (user: "the nav menu is visible without clicking... scroll to the side and I see it"). Fix: render backdrop + panel through `createPortal(menu, document.body)` (viewport containing block restored), gated client-side with `useSyncExternalStore` (`false` on SSR, `true` in browser) so the server never calls `createPortal`. `react-hooks/set-state-in-effect` rejected a `useEffect`+`setMounted` variant — the external-store hook is the clean approach. The hamburger toggle stays inline in the navbar. Verified: `eslint` + `tsc` green; compiled chunk `components_1mridcf._.js` contains `createPortal`.
- Feature 13 browser leg: standalone and in-route the Stagehand v3.7.1 + Browserbase flow works (session create → `stagehand.init()` → `activePage()` → goto `domcontentloaded` → `page.evaluate` innerText). The live `browserSkipped: true` was Groq free-tier hitting its 200k tokens/day cap mid-extraction (429 at ~198.8k used); the 20s spacer doesn't guard daily TPD, only the 8000 TPM burst window. `extractHomepage`/`extractSubPage`/`browseCompany` goto now `console.warn` the failure instead of returning null silently — without that, a rate-limited browser leg degrades to an inferred-only dossier with no signal. Expect the 200k TPD cap to recur on any multi-run E2E day; plan browser research runs accordingly or upgrade the Groq tier.
- **Job-detail click fixes (Aug 8, Feature 12 follow-up)**: two bugs made "clicking a job" fail. (1) Search results that weren't persisted (<70% match) got `id = source_url`, so `isSavedJobId()` was false and company/role rendered as plain text — with only ~5 of 50 jobs persisted, ~90% of rows were dead. Fix in `app/find-jobs/page.tsx`: company + role now render through a `JobLink` helper — saved (UUID) ids deep-link to `/jobs/{id}`, non-saved ids open the external `source_url` in a new tab (`target="_blank"`), plain text only as last resort; `MockJob`/`RealJob`/`toRowShape` now carry `source_url`. (2) `/jobs/*` was missing from `proxy.ts` `protectedRoutes`, so the detail page's server actions (`getSessionUser`, `getJob`) ran without the proxy's `updateSession` refresh — with a >15-min-old access token, clicking a job bounced to `/login` instead of the detail. Fix: added `"/jobs"` to `protectedRoutes`; logged-out visitors now get a server 307 → `/login` and authed users always get a refreshed token header. Verified: `eslint` + `tsc` green, detector `[]`, live checks — `/` 200, `/find-jobs` 307, `/jobs/{uuid}` 307 for an anonymous request (requires `next dev` restart to pick up the proxy change).
- **Every job now deep-links to the internal details page (Aug 12, Feature 12 follow-up)**: user reported clicking a job opened the Adzuna posting instead of the Job Details page (`job-details.png` design). Root cause: `app/api/agent/find/route.ts` persisted ONLY strong matches (≥70), so non-persisted rows were returned with `id = source_url` and `JobLink` in `app/find-jobs/page.tsx` rendered them as external `<a target="_blank">` links — most of a 25-job search dumped the user on Adzuna. Fix: the route now persists EVERY scored job (`result.saved` instead of `result.strong`, dedupe on `(user_id, source_url)` unchanged) and records `agent_runs.jobs_found` = all scored jobs; `JobLink` always deep-links to `/jobs/{id}` (external fallback + `isSavedJobId` removed). Side effects (all intended): reload now shows the full scored list incl. <70% rows (matches the in-session list and the "Low Matches (<70%)" band), and dashboard "Total Jobs Found"/"Jobs This Week" counts now include every found job. Verified: `eslint` + `tsc` + `next build` green.
