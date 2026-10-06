# Memory — Features 08–13 (Job Details + Company Research Agent)

Last updated: August 8, 2026

## What was built

- **Feature 08 Resume PDF generation, 09 Saved Jobs, 10 AI Matching, 11 Job Search, 12 Job Details** — complete and verified (per `context/progress-tracker.md`).
- **Feature 13 Company Research Agent** — complete and route-E2E-verified this session:
  - `app/api/agent/research/route.ts` — POST `{ jobId }`: session gate 401, body 400, job scoped to user (500/404), profile (500/422), `researchCompany`, persists dossier to `jobs.company_research`, PostHog `company_researched` + `shutdown()`, returns `{ dossier, browserSkipped }` (502 on LLM failure).
  - `agent/research.ts` — Groq-only (no OpenAI): `deriveHomepageUrl`, `browseCompany` (Browserbase + Stagehand v3.7.1, `disableAPI`, `domcontentloaded`; homepage JSON extraction + up to 3 prioritized sub-pages), `synthesizeDossier` (gpt-oss-120b, JSON mode, `max_tokens` 1200). Module-level 20s rate-limit spacer between LLM calls. This session added failure logging to the browser leg.
  - `lib/browserbase.ts` — `createCompanyResearchSession()` mints a session from `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` (both in `.env.local`).

## Decisions made

- Agent code (`agent/`) is only called from API routes, never server actions.
- AI provider is **Groq only** (`openai/gpt-oss-120b`, not `gpt-4o` — Groq free tier doesn't host it). No `OPENAI_API_KEY`/`gpt-4o` references remain.
- Synthesis `max_tokens` is **1200** (800 truncates the JSON on gpt-oss-120b). `context/library-docs.md` documents this.
- Dev server runs backgrounded/detached; logs at `.next/dev/logs/next-development.log` (does NOT capture route-handler `console.warn` — use file-based debug logging or terminal).
- Browser extraction failure logging added to `extractHomepage`/`extractSubPage`/`browseCompany` goto — failures now `console.warn` instead of silently returning null.

## Problems solved

- **`browserSkipped: true` on live runs was NOT a code bug**: the browser leg works both standalone and in-route (session create → `stagehand.init()` → `activePage()` → goto → innerText 11k chars verified via staged debug log). The null came from **Groq free-tier 200k tokens/day cap** (429 at ~198.8k used) hitting the homepage extraction call, which `extractHomepage` swallowed into a silent null. The 20s spacer guards only the 8000 TPM burst window, not daily TPD. Expect this cap to recur on multi-run E2E days.
- **InsForge verification OTP**: read the leading 6 digits from the email **subject** (`"415101 is your verification code"`), not the body (`\b(\d{6})\b` false-positives on `000000` in AWS tracking URLs). Do NOT call resend — it rotates the OTP and `verifyEmail` then fails `400 INVALID_INPUT`.
- **mail.tm works** for throwaway inboxes (emalupe.com); mailinator/1secmail blocked without tokens.
- **Session cookie**: `insforge_access_token`. Auth endpoints: signup `POST /api/auth/users`, `verifyEmail({ email, otp })`, password sign-in `POST /api/auth/sessions`.
- Next.js dev server is PID on port 3000; starting a second `next dev` autopicks port 3001 — don't double-start.

## Current state

- Phase 1 (01–04) ✅, Phase 2 (05–07) ✅, Phase 3 (08–11) ✅, Phase 4 (12–13) ✅, Phase 5 (14 Dashboard UI) ✅.
- Feature 13 route E2E green: no-auth 401, authed + bogus UUID 404, authed + real job 200 (full dossier with techStack incl. "Kubernetes (missing)", gapsToAddress, sources). The 200 run's `browserSkipped: true` was the Groq TPD cap, now logged honestly.
- **Pending**: a clean `browserSkipped: false` route re-run (real browser data, no `"(inferred)"` flags) — blocked until Groq daily token budget resets.
- `eslint`, `tsc --noEmit`, `npm run build` all green.
- `e2e-route-setup.mjs` + `e2e-route-run.mjs` in repo root for the re-run; throwaway session json in `%TEMP%\opencode\e2e-session.json` (contains a live JWT — redact/delete if committed). Clean up after the re-run.
- Everything remains UNCOMMITTED (only the Create Next App initial commit exists). Not committing until the user asks.

## Next session starts with

1. Either (a) re-run `e2e-route-run.mjs` for `browserSkipped: false` once Groq quota frees up (re-create fixture via `e2e-route-setup.mjs` first — JWT expires ~15 min), then delete the e2e scripts + session json; or (b) if the user prefers to move on, start **Feature 15 Stats Bar — Real Data** (Phase 5 spec in `context/code-standards.md`) and defer the browserSkipped re-run.
2. Run `npx eslint`, `npx tsc --noEmit`, `npm run build` after any changes.

## Open questions

- Whether the Groq free-tier TPD cap is acceptable for real usage (browser research does ~5 LLM calls per run: homepage + up to 3 sub-pages + synthesis) or a Groq tier upgrade is warranted.
- `AGENTS.md` says Tailwind 3.4 but the project is on Tailwind v4 (`@theme` in globals.css) — unresolved.
- `context/library-docs.md`/`build-plan.md`/`project-overview.md` contain stale content (old PostHog keys, `getPublicUrl` storage examples that don't work for the private `resumes` bucket, code-standards/build-plan possibly mislabeled).
- `folder/` is a stray separate InsForge project (gitignored) — consider deleting.
