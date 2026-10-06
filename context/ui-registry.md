# UI Registry

Component patterns and design conventions for consistency across all features.

---

## Homepage Component Patterns

### Navbar
- **Pattern**: Rendered by `NavAuth` (`components/nav-auth.tsx`) — full-width sticky nav, logo left, centered links, CTA right
- **Classes**: `sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl`
- **Container**: `mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8` (logo + CTA columns justify content to the edges, links stay centered)
- **Logo**: Rounded-square badge (`bg-accent`, white bold letter) + uppercase letterspaced brand text "Jobseek"
- **Links**: Text links with secondary color, hover to primary
- **CTA Button**: `bg-accent` + `text-accent-foreground`, `hover:bg-accent-dark`, shadow
- **Mobile**: `MobileNav` translucent glass slide-in sidebar below `md`
- **Spacing**: Logo + text in flex gap-3; nav items gap-8
- **Mobile placement**: right-side actions div carries `col-start-3` — with the centered links `hidden` below `md`, auto-placement would drop the CTA/hamburger into the center column; pinning it to col 3 keeps it in the right corner

### Hero Section
- **Pattern**: Large centered text with dual CTA buttons, ambient glows, centered dashboard preview card
- **Background**: `relative overflow-hidden border-b border-border bg-surface` with absolute blurred glows (`bg-accent-muted`, `bg-success-lightest`, `bg-info-lightest` circles, `blur-3xl`) behind a `relative` content container
- **Heading**: 5xl-6xl font bold, text-text-primary
- **Subheading**: Large text, text-text-secondary
- **Buttons**: Primary uses `bg-accent` + `hover:bg-accent-dark` with rounded-lg corners and white text; secondary uses accent-light background with accent text in flex gap-4
- **Preview card**: `relative mx-auto mt-16 max-w-2xl` with `-inset-4` blurred gradient halo, `rounded-[24px] border border-border bg-surface p-4 sm:p-6` + `shadow-[0_24px_64px_rgba(15,23,42,0.08)]`
- **Layout**: Centered column with max-w-3xl text block, text-center

### Feature Cards (3-column grid)
- **Pattern**: Cards with numbered badge, title, description
- **Classes**: `rounded-2xl border border-border bg-surface p-8`
- **Badge**: Circular bg-accent-light with accent text number
- **Title**: Font-semibold text-text-primary
- **Description**: Text-text-secondary
- **Grid**: `gap-12 md:grid-cols-3`

### Features Grid (2-column checkmark grid)
- **Pattern**: Checkmark bullet points with title and description
- **Classes**: `flex gap-4 rounded-2xl border border-border bg-surface-secondary p-6`
- **Checkmark**: Circular bg-success-light, green checkmark text
- **Title**: Font-semibold text-text-primary
- **Description**: Small text-text-secondary
- **Grid**: `gap-8 md:grid-cols-2`

### Testimonial Cards (3-column grid)
- **Pattern**: 5-star rating, quote, name/role
- **Classes**: `rounded-2xl border border-border bg-surface p-8`
- **Stars**: Yellow text "★★★★★"
- **Quote**: Text-text-secondary with quotes
- **Name**: Font-semibold text-text-primary
- **Role**: Small text-text-muted
- **Grid**: `gap-8 md:grid-cols-3`

### CTA Section
- **Pattern**: Centered headline, description, single button
- **Classes**: `rounded-2xl border border-border bg-surface p-8` (for container)
- **Heading**: 4xl font bold text-text-primary
- **Description**: Large text-text-secondary
- **Button**: Accent background, shadow, hover state
- **Layout**: Centered max-w-2xl, text-center

### Footer
- **Pattern**: 4-column link grid + copyright bar
- **Grid**: `gap-8 md:grid-cols-4`
- **Column Heading**: Font-semibold text-text-primary
- **Links**: Small text-text-secondary with hover to primary
- **Copyright**: Centered small text-text-muted with top border-border

---

## Design Token Usage Reference

**Colors Used:**
- Backgrounds: `bg-background`, `bg-surface`, `bg-surface-secondary`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Accent: `bg-accent`, `text-accent-foreground`, `bg-accent-light`, `text-accent`
- Success: `bg-success-light`, `text-success`
- Warning: `text-warning` (for stars)
- Borders: `border-border`

**Spacing:**
- Navbar items: gap-8
- Card internals: gap-4, p-8, p-6
- Section grids: gap-12, gap-8
- Padding: px-6, py-20

**Border Radius:**
- Navbar/cards: rounded-2xl
- Buttons/badges: rounded-full

---

## Consistency Rules

1. **Never use raw Tailwind colors** — Use design tokens only (bg-accent, not bg-green-600)
2. **Spacing is consistent** — Sections use py-20, cards use p-8, gap-8 for content grids
3. **Border colors** — All borders use `border-border` (default) or `border-border-light` for subtle dividers
4. **Text hierarchy** — Primary = headings, Secondary = body text, Muted = timestamps/metadata
5. **Buttons follow pattern** — Accent bg + shadow + hover state, or outline style for secondary
6. **Hover states** — Links go from secondary to primary text color
7. **Card pattern** — `border border-border rounded-2xl bg-surface p-8` is standard

---

## Auth & Profile Components

### Auth Page (2-Column Login Layout)

File: `app/(auth)/login/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Navbar | inline `<nav>` — `sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl` with centered `grid grid-cols-[1fr_auto_1fr]` layout (logo left, links center, accent CTA right; right actions pinned with `col-start-3` so mobile keeps the CTA in the right corner) |
| Page wrapper | `flex min-h-screen flex-col` |
| Content container | `mx-auto flex w-full max-w-5xl flex-1 items-center px-6 lg:px-8` |
| Grid columns | `grid w-full gap-8 lg:grid-cols-2 lg:gap-8` |
| Left column | `flex flex-col justify-center lg:pr-4` |
| Right column | `flex items-center justify-center` |
| Brand pill | `inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-sm font-medium text-accent` |
| Pill dot | `flex h-2 w-2 rounded-full bg-accent` |
| Headline | `text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-text-primary` |
| Accent span | `text-accent` (within headline) |
| Description | `text-base leading-relaxed text-text-secondary max-w-md` |
| Feature checkmark row | `flex items-center gap-2` |
| Checkmark circle fill | `text-success-light` (`fill="currentColor"` on SVG circle) |
| Checkmark path stroke | `text-success` |
| Feature label text | `text-sm text-text-secondary` |

**Pattern notes:**
- Left column contains value proposition (headline + description + feature list)
- Right column contains the sign-in card
- Feature checkmarks use the same SVG pattern: 16x16 green circle with white checkmark
- Gap between feature badges is `gap-6` (24px)
- Headline uses `text-accent` on highlighted words

### Sign-In Card

File: `app/(auth)/login/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Card wrapper | `w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm` |
| Card icon | `flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-light text-sm font-bold text-accent` |
| Card title | `text-xl font-bold tracking-tight text-text-primary` |
| Card subtitle | `text-sm text-text-secondary` |
| OR divider | `mt-8 flex items-center gap-3` |
| Divider line | `flex-1 border-t border-border` |
| OR text | `text-xs text-text-muted` |
| Terms text | `mt-6 text-center text-xs leading-relaxed text-text-muted` |
| Terms link | `text-accent underline underline-offset-2 transition-colors hover:text-accent-dark` |

### OAuth Buttons

File: `app/(auth)/login/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Button wrapper | `flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm` |
| Default state | `transition-all duration-200` |
| Hover state | `hover:bg-surface-secondary hover:shadow-md` |
| Disabled state | `disabled:cursor-not-allowed disabled:opacity-60` |
| Button gap | `gap-3` between icon and text |
| Button group | `space-y-3` |
| Loading spinner | `flex h-5 w-5 items-center justify-center` → `h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent` |

**Pattern notes:**
- OAuth buttons are full-width in card (`w-full`)
- Google uses colored SVG icons, GitHub uses `fill="currentColor"` SVG
- Loading state replaces icon with spinner, disables all buttons (`loading !== null`)
- OAuth buttons are stacked vertically with `space-y-3`

### Protected Page Layout (Dashboard / Profile)

File: `app/dashboard/page.tsx`, `app/profile/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Page wrapper | `flex min-h-screen flex-col bg-background` |
| Navbar | `SiteNavbar` (`components/site-navbar.tsx`) |
| Content container | `mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6` |
| Card | `w-full rounded-2xl border border-border bg-surface p-8 shadow-sm` |
| Section title | `text-2xl font-bold tracking-tight text-text-primary` |
| Section subtitle | `text-sm text-text-secondary` |
| Info container (sheet) | `rounded-xl border border-border bg-surface-secondary p-5` |
| Info grid | `grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm` |
| Info label | `text-text-muted` |
| Info value | `text-text-primary` |
| User ID value | `font-mono text-xs text-text-muted` |
| Logo badge | `flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm` |
| Logo text | `text-sm font-semibold uppercase tracking-[0.24em] text-text-primary` |
| Nav link | `text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary` |
| Nav link gap | `gap-8` |

### Success Notification Banner (Toast)

File: `app/profile/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Banner container | `fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300` |
| Banner inner | `flex items-center gap-3 rounded-xl border border-success-light bg-success-lightest px-5 py-3 shadow-lg` |
| Icon circle | `flex h-8 w-8 items-center justify-center rounded-full bg-success` |
| Icon SVG | white checkmark on green circle |
| Title text | `text-sm font-semibold text-success-foreground` |
| Subtitle text | `text-xs text-success-foreground/70` |
| Dismiss button | `ml-2 flex h-6 w-6 items-center justify-center rounded-full text-success-foreground/50 transition-colors hover:bg-success/20 hover:text-success-foreground` |

**Pattern notes:**
- Banner appears at the top of the viewport, centered horizontally
- Uses `animate-in fade-in slide-in-from-top-2` for entrance animation
- Auto-dismisses after 5 seconds via `setTimeout`
- Dismiss button uses X icon
- Only shown on first visit after sign-in (controlled by `?signedIn=true` param)
- URL is silently cleaned via `window.history.replaceState` after showing

### Auth-Confirmation Row (Signed-In Status + Sign-Out)

File: `app/profile/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Row wrapper | `flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-5` |
| Status text | `text-sm font-semibold text-text-primary` |
| User name highlight | `text-accent` |
| Provider label | `mt-0.5 text-xs text-text-muted` |
| Sign-out button | `flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm` |
| Sign-out hover | `hover:bg-surface-secondary hover:shadow-md` |
| Sign-out disabled | `disabled:cursor-not-allowed disabled:opacity-60` |

**Pattern notes:**
- Row has two items on each end: status text on left, sign-out button on right
- Sign-out button uses `justify-between` flex on the parent
- Sign-out icon is a door/arrow SVG (14x16)
- Loading state shows inline spinner instead of icon

### Avatar (Initial Circle)

File: `app/profile/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Avatar circle | `flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-xl font-bold text-accent` |
| Content | First character of name or email, uppercase |

### Loading Spinner

File: `app/(auth)/callback/page.tsx`, `app/dashboard/page.tsx`, `app/profile/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Wrapper | `flex min-h-screen items-center justify-center bg-background` |
| Spinner container | `flex h-10 w-10 items-center justify-center` |
| Spinner | `h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent` |

**Pattern notes:**
- Consistent across all auth-gated pages
- Full-screen centered layout (`flex min-h-screen items-center justify-center`)
- Spinner is a ring (`border-2 rounded-full`) with top segment colored accent, rest border-colored
- Size: h-6 w-6 (24px). Some contexts use h-5 w-5 (20px) for inline spinners.

### Full-Width Sign-Out Button

File: `app/dashboard/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Button | `flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm` |
| Hover | `hover:bg-surface-secondary hover:shadow-md` |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-60` |
| Icon | SVG door/arrow 16x16 |

### Callback Loading Page

File: `app/(auth)/callback/page.tsx`
Last updated: July 26, 2026

| Property | Class |
| -------- | ----- |
| Wrapper | `flex min-h-screen flex-col items-center justify-center bg-background` |
| Content group | `flex flex-col items-center gap-4` |
| Loading text | `text-sm text-text-secondary` |

---

## Profile Page (Feature 05)

File: `app/profile/page.tsx`
Last updated: August 7, 2026

### Page Layout

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Page wrapper | `flex min-h-screen flex-col bg-background` |
| Navbar | `SiteNavbar` (`components/site-navbar.tsx`) |
| Content container | `mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:px-8` |
| Card stack | `space-y-6` |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm` |
| Large card (form) | `rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8` |
| Card title | `text-base font-semibold text-text-primary` |
| Card subtitle | `mt-1 text-sm text-text-secondary` |

### Navbar with Icons + Active State

File: `components/site-navbar.tsx`
Last updated: August 8, 2026

| Property | Class |
| -------- | ----- |
| Container | `sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl` → inner `mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8` |
| Logo badge | `flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm` |
| Logo text | `text-sm font-semibold uppercase tracking-[0.24em] text-text-primary` ("Jobseek") |
| Nav link | `flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary` |
| Active nav link | `relative flex items-center gap-1.5 text-sm font-medium text-accent` |
| Active underline | `absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full bg-accent` |
| Nav icon | 16x16 stroke SVG (`h-4 w-4`), `stroke="currentColor"` |
| Notification dot | `absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent` (on Find Jobs icon, `showFindJobsNotification` prop) |
| Sign-out icon button | `flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary shadow-xs hover:bg-surface-secondary hover:text-text-primary` |

**Pattern notes:**
- Props: `active: "dashboard" | "find-jobs" | "profile"`, `onSignOut`, `signingOut?`, `showFindJobsNotification?`.
- Replaces the per-page inline navbars on dashboard / find-jobs / profile / jobs/[jobId]; each page passes its own `active`.
- Owns the Dashboard / Find Jobs / Profile links + User icon button → Sign Out; page components no longer define nav icons.
- Desktop links centered via the `[1fr_auto_1fr]` grid; logo in col 1 (`justify-self-start`), links in col 2, sign-out in col 3 (`justify-self-end`).

### Attention Card + Progress Ring

| Property | Class |
| -------- | ----- |
| Row layout | `flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between` |
| Alert icon circle | `flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error/10 text-error` |
| Missing-field badge | `rounded-md bg-error/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-error` |
| Progress ring SVG | 76x76, `stroke-width 7`, `stroke-linecap round`, track `stroke-border-light`, arc `stroke-error`, `-rotate-90` |
| Ring center | `text-lg font-bold text-text-primary` value + `text-[10px] uppercase tracking-wide text-text-muted` label |

### Connected Accounts Card

| Property | Class |
| -------- | ----- |
| Inner container | `mt-4 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between` |
| Brand icon tile | `flex h-10 w-10 items-center justify-center rounded-lg bg-linkedin-light text-linkedin` |
| Brand action button | `shrink-0 rounded-lg bg-linkedin px-4 py-2 text-sm font-semibold text-linkedin-foreground shadow-sm hover:bg-linkedin/90` |

### Resume Card

| Property | Class |
| -------- | ----- |
| Drop zone | `mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center` |
| Drop zone idle | `border-border bg-surface-secondary hover:border-accent/40 hover:bg-surface-muted` |
| Drop zone dragging | `border-accent bg-accent-muted` |
| Upload icon tile | `mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-accent shadow-sm` |
| Generate bar | `mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between` |

### Form Field Patterns

| Property | Class |
| -------- | ----- |
| Field label | `mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary` |
| Input base | `w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary shadow-xs placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25` |
| Input with icon | same + `pl-9`, icon `pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted` |
| Read-only input | `cursor-not-allowed bg-surface-secondary/60` |
| Select | input base + `appearance-none pr-9 cursor-pointer`, chevron `absolute right-3 top-1/2 -translate-y-1/2 text-text-muted` |
| Textarea | input base + `resize-none leading-relaxed` |
| Field grid | `mt-5 grid gap-4 sm:grid-cols-2` |
| Add button (tag input) | `shrink-0 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-xs hover:bg-surface-secondary` |
| Tag pill | `inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-medium text-text-primary` |
| Tag remove | `text-text-muted transition-colors hover:text-error` |
| Section divider | `mt-6 border-t border-border pt-6` |
| Section heading | `text-base font-semibold text-text-primary` |
| Text-link action | `flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark` (e.g. "+ Add role") |
| Role card | `rounded-xl border border-border bg-surface-secondary p-5` |
| Checkbox label | `flex shrink-0 cursor-pointer items-center gap-2 text-sm text-text-secondary`, checkbox `h-4 w-4 cursor-pointer rounded border-border accent-accent` |
| Primary submit | `mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent-dark hover:shadow-md` |

**Pattern notes:**
- Profile form is controlled `useState` mock data; Save Profile form has `onSubmit={e => e.preventDefault()}` no-op until Feature 06
- TagInput supports Enter key + Add button; tags dedupe on add
- All icons are inline 16x16 (or 20x20 upload/linkedin) stroke SVGs with `currentColor`

---

## NavAuth (Auth-Aware Marketing Navbar)

File: `components/nav-auth.tsx`
Last updated: August 8, 2026

Renders the **full homepage navbar** (`<nav>` + logo + centered links + CTA or auth actions) based on server-passed user state. The homepage renders just `<NavAuth user={user} />` — no inline nav wrapper.

### Container

| Property | Class |
| -------- | ----- |
| Nav | `sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl` |
| Inner | `mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8` (right actions pinned with `col-start-3` so mobile keeps the CTA/hamburger in the right corner) |
| Logo | `flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm` + "Jobseek" letterspaced text |

### Logged Out ("Start for free")

| Property | Class |
| -------- | ----- |
| Primary link | `rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md` |
| Target | `/login` |

### Logged In (Centered Links + Sign Out)

| Property | Class |
| -------- | ----- |
| Group | `hidden items-center gap-8 md:flex` (col 2) |
| Nav link | `text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary` |
| Sign-out button | `hidden rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition-all duration-200 hover:bg-surface-secondary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 md:block` — text label "Signing out..." while `signingOut` |
| Mobile | `<MobileNav active="dashboard" ... />` inside a `md:hidden` wrapper |

**Pattern notes:**
- Same three-column `[1fr_auto_1fr]` centering grid as `SiteNavbar`; the logged-in desktop links + sign-out mirror the app navbar so logged-in users get a consistent header on the homepage.
- Logged-out state uses the accent-filled CTA (`bg-accent` + `hover:bg-accent-dark`) — the same family as the hero primary buttons.
- After sign-out: `router.replace("/")` + `router.refresh()` (returns to homepage in logged-out state).
- Mobile: renders `MobileNav` below `md` when logged in; logged-out mobile shows only the logo + CTA link.

---

## SiteNavbar (Shared App Navbar)

File: `components/site-navbar.tsx`
Last updated: August 8, 2026

| Property | Class |
| -------- | ----- |
| Nav | `sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl` |
| Inner | `mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8` (right actions pinned with `col-start-3` so mobile keeps the hamburger in the right corner) |
| Logo badge | `flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground shadow-sm` |
| Logo text | `text-sm font-semibold uppercase tracking-[0.24em] text-text-primary` ("Jobseek") |
| Active link | `relative flex items-center gap-1.5 text-sm font-medium text-accent` + `absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full bg-accent` underline |
| Idle link | `flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary` |
| Sign-out button | `hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 md:flex` |
| Loading spinner | `h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent` (replaces icon while `signingOut`) |

**Pattern notes:**
- Props: `{ active, onSignOut, signingOut?, showFindJobsNotification? }`. `active` is `"dashboard" | "find-jobs" | "profile"`.
- Single source of truth for the app nav — used on dashboard / find-jobs / profile / jobs/[jobId].
- Centered links via `[1fr_auto_1fr]` grid (col 2), logo `justify-self-start` (col 1), sign-out `justify-self-end` (col 3). Right-actions div also carries `col-start-3` so the hamburger stays in the right corner below `md` (the hidden links column would otherwise pull it to the center).
- Includes the `MobileNav` hamburger below `md`.
- `showFindJobsNotification` renders the accent dot on the Find Jobs link (profile page).

---

## Find Jobs Page (Features 09–11)

File: `app/find-jobs/page.tsx`
Last updated: August 8, 2026

### Page Layout

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Page wrapper | `flex min-h-screen flex-col bg-background` |
| Navbar | `SiteNavbar` (`components/site-navbar.tsx`) |
| Content container | `mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:px-8` |
| Card stack | `space-y-6` |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm` |
| Table card | `overflow-hidden rounded-2xl border border-border bg-surface shadow-sm` |

### Search Card

| Property | Class |
| -------- | ----- |
| Form grid | `grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]` |
| Field label | `mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary` |
| Search input | `inputBase` + `pl-9` (icon `absolute left-3 top-1/2 -translate-y-1/2 text-text-muted`) |
| Find Jobs button | `flex h-[42px] items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent-dark hover:shadow-md` + `disabled:cursor-not-allowed disabled:opacity-60` |
| Searching state | button shows `h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground` + "Searching…" label |
| Inline error | `mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error` |
| Found banner | `mt-4 flex items-center gap-2.5 rounded-xl bg-success-lightest px-4 py-3` with `text-success` sparkles icon + `text-success-foreground` text — **rendered only after a real search** (real `{found, saved}` counts) |

### Filter + Sort Bar

| Property | Class |
| -------- | ----- |
| Row | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` |
| Filter input | `inputBase` + `pl-9`, wrapper `relative w-full sm:max-w-xs`, `[&::-webkit-search-cancel-button]:hidden` |
| Compact select | `cursor-pointer appearance-none rounded-lg border border-border bg-surface py-2 pl-3.5 pr-9 text-sm font-medium text-text-primary shadow-xs hover:bg-surface-secondary` + chevron overlay (`h-3.5 w-3.5`) |
| Band options | `All Matches` / `Strong Matches (80%+)` / `Great Matches (90%+)` / `Low Matches (<70%)` |
| Sort options | `Date Found` (default) / `Oldest First` / `Match Score` / `High Matches First` / `Low Matches First` / `Company A–Z` |
| Select wrapper | `relative` + aria-label on `<select>` (a11y) |

### Results Table

| Property | Class |
| -------- | ----- |
| Table | `w-full min-w-[760px] border-collapse text-left` inside `overflow-x-auto` |
| Header cell | `px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted` on `tr.border-b border-border bg-surface-secondary/50` |
| Row | `border-b border-border last:border-0 transition-colors duration-150 hover:bg-surface-secondary/60` |
| Data cell | `px-6 py-4` |
| Company cell | `th` with `scope="row"` + `px-6 py-4 font-medium` |
| Company avatar | `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary text-sm font-bold text-text-primary` |
| Deep-link cell | company + role cells render through `JobLink` (`id`, `sourceUrl`): saved jobs (UUID id) → `Link href="/jobs/{id}"`; non-saved jobs → external `<a href={source_url} target="_blank" rel="noopener noreferrer">`; both `hover:text-accent`. Falls back to plain text only when neither applies |
| Match bar track | `h-1.5 w-16 overflow-hidden rounded-full bg-border` + `role="progressbar"` |
| Match bar fill | `h-full rounded-full bg-success` / `bg-info` / `bg-warning` (score ≥90 / 80-89 / <80) |
| Percent | `text-sm font-semibold tabular-nums text-text-primary` |
| Salary | `text-sm tabular-nums text-text-secondary` |
| Date | `text-sm text-text-muted` |
| Empty state | `px-6 py-14 text-center` with title + muted hint |
| Footer | `flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between` |
| Pagination button | `rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary shadow-xs hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40` |
| Active page | `h-8 min-w-8 rounded-lg px-2.5 bg-accent text-accent-foreground shadow-sm` |
| Page button idle | `h-8 min-w-8 rounded-lg px-2.5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary` |
| Ellipsis | `px-1.5 text-sm text-text-muted` |

**Pattern notes:**
- Match score color coding by threshold: ≥90 `bg-success` (green), 80–89 `bg-info` (blue), <80 `bg-warning` (orange)
- Search card is LIVE: POSTs `{ jobTitle, location }` to `/api/agent/find` (Adzuna + Groq matcher); spinner + inline error + real summary banner
- On load the page renders the user's saved jobs from the DB (`getSavedJobs()`); mock dataset removed — initial state is `[]`
- Empty state has 4 distinct cases (no jobs found for search / no matches / no saved jobs yet / filters emptied the list) with matching hint copy
- Filter/sort changes reset to page 1; pagination clamps `currentPage` to `totalPages` when results shrink
- Match-bar fill uses inline `style={{ width }}`; `role="progressbar"` + aria attributes on the track
- Search results also show low (<70%) matches in-session (the API returns every scored job); a reload shows only persisted strong matches

---

## Job Details Page (Feature 12)

File: `app/jobs/[jobId]/page.tsx`
Last updated: August 8, 2026

### Page Layout

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Page wrapper | `flex min-h-screen flex-col bg-background` |
| Navbar | `SiteNavbar` (`components/site-navbar.tsx`) |
| Content container | `mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:px-8` |
| Card stack | `space-y-6` |
| Loading wrapper | `flex min-h-screen items-center justify-center bg-background` |
| Loading spinner | `flex h-10 w-10 items-center justify-center` → `h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent` |

### Job Header Card

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8` |
| Company avatar | `flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-xl font-bold text-text-primary` (first char of company, uppercase) |
| Job title | `text-xl font-bold text-text-primary sm:text-2xl` |
| Company name | `mt-1 text-sm text-text-secondary` |

### Match Score Badge

| Property | Class |
| -------- | ----- |
| Badge container | `inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tabular-nums` |
| ≥90 | `bg-success-lightest text-success` |
| 70–89 | `bg-success-light text-success` |
| 50–69 | `bg-warning text-warning-foreground` |
| null / <50 | `bg-surface-secondary text-text-secondary` |

### Action Buttons

| Property | Class |
| -------- | ----- |
| Primary (Apply Now) | `inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-dark hover:shadow-md` |
| Secondary (View Job Post) | `inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:shadow-sm` |
| Disabled (Research Company) | `inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-accent/40 px-5 py-2.5 text-sm font-semibold text-accent-foreground` |
| Back link | `inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent` |

### Info Cards (Salary / Location / Job Type / Date)

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-border bg-surface p-5 shadow-sm` |
| Label | `text-[11px] font-semibold uppercase tracking-wider text-text-muted` |
| Value | `mt-2 text-sm font-semibold text-text-primary` |
| Grid | `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4` |

### Section Cards (AI Reasoning / Skills / Description)

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm` |
| Title | `mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-primary` |
| Body text | `text-sm leading-relaxed text-text-secondary` |
| Muted text | `text-sm text-text-muted` |
| Section divider (list titles) | `mt-5`, heading `text-sm font-semibold text-text-primary`, list `mt-2 list-disc space-y-1.5 pl-5 text-sm text-text-secondary` |

### Score Bar

| Property | Class |
| -------- | ----- |
| Track | `h-2 w-24 overflow-hidden rounded-full bg-border` |
| Fill | `h-full rounded-full bg-success` (≥90) / `bg-info` (80–89) / `bg-warning` (<80) |
| Width | inline style `width: {score}%` |

### Skill Pills

| Property | Class |
| -------- | ----- |
| Sub-heading (Matched) | `text-xs font-semibold uppercase tracking-wider text-success` |
| Sub-heading (Missing) | `text-xs font-semibold uppercase tracking-wider text-text-muted` |
| Matched pill | `inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground` + CheckIcon |
| Missing pill | `inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold text-accent` + CrossIcon |
| Pill row | `mt-3 flex flex-wrap gap-2` |

### Company Research (Placeholder)

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-dashed border-border bg-surface p-6 shadow-sm` |
| Title | `text-sm font-semibold uppercase tracking-wide text-text-primary` |

**Pattern notes:**
- Match-score band thresholds differ by context: badge has 4 bands (≥90 / 70–89 / 50–69 / else); the results-table and score-bar fill use 3 bands (≥90 green / 80–89 blue / <80 orange).
- Info cards use `p-5` (not the standard card `p-6`) for the dense 4-up grid; all other cards use `p-6`.
- `border-dashed` is reserved for "coming soon" placeholder cards (Company Research); live cards use solid `border-border`.
- The two action buttons share the `px-5 py-2.5 text-sm font-semibold` sizing family — primary is accent-filled, secondary is bordered-surface.
- Empty states are all plain `text-sm text-text-muted` (skill lists, description, reasoning fallback).
- Array-section builders (`BulletList`) render nothing when the array is empty — sections are omitted, never shown blank.

---

## MobileNav (Shared Mobile Slide-In Sidebar)

File: `components/mobile-nav.tsx`
Last updated: August 8, 2026

| Property | Class |
| -------- | ----- |
| Wrapper | `md:hidden` (rendered below `md` only) |
| Hamburger button | `flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-secondary hover:text-text-primary hover:shadow-sm` |
| Toggle icon | MenuIcon (3 lines) ↔ CloseIcon (X), 16x16 stroke SVG |
| Backdrop | `fixed inset-0 z-40 bg-overlay/40 backdrop-blur-sm transition-opacity duration-300` (fades in/out, invisible when closed) |
| Panel | `fixed inset-y-0 right-0 z-50 flex w-72 flex-col overflow-hidden border-l border-border bg-surface/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out` — slides via `translate-x-full` → `translate-x-0` |
| Panel header | `flex items-center justify-between border-b border-border px-5 py-4` — logo badge `bg-accent text-accent-foreground` ("J" tile) + "Jobseek" letterspaced `text-text-primary` |
| Close button | `flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary` |
| Nav list | `space-y-1` links `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium` |
| Nav link idle | `text-text-secondary hover:bg-surface-secondary hover:text-text-primary` |
| Nav link active | `bg-accent-muted text-accent` + `aria-current="page"` |
| Sign-out divider | `border-t border-border p-3` |
| Sign-out item | `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary` + `disabled:cursor-not-allowed disabled:opacity-60`, label "Signing out…" while `signingOut` |

**Pattern notes:**
- Props: `active: "dashboard" | "find-jobs" | "profile"`, `onSignOut`, `signingOut`.
- Full-height right-side panel (`inset-y-0 right-0 w-72`) with a translucent glass finish — `bg-surface/90 backdrop-blur-xl` + `border-l border-border` (matches the sticky navbar's `bg-surface/80 backdrop-blur-xl`). No gradient; dark text on light surface; active pill is `bg-accent-muted` tint with accent text.
- **Portal requirement**: the backdrop + panel render via `createPortal(menu, document.body)` — the parent `<nav>` carries `backdrop-blur-xl`, whose `backdrop-filter` establishes a containing block for `fixed` descendants. Without the portal, `inset-y-0`/`right-0` resolve against the navbar box (panel clips to ~73px tall, hidden items) and the closed `translate-x-full` panel sits inside the scroll area (visible on horizontal scroll). Portal restores viewport positioning. Client-gating via `useSyncExternalStore` (returns `false` on SSR, `true` in the browser) so the server never calls `createPortal`.
- Accessibility: `aria-expanded`, `aria-controls="mobile-nav-panel"`, `aria-label` toggle; closes on Escape, backdrop click, and link click; locks body scroll while open.
- Animation is pure `transition-transform` (Tailwind v4 — no plugin): `-translate-x-full` when closed on a `.translate-x-0`-style slot; `translate-x-full` when closed, `translate-x-0` when open.
- Used inside `SiteNavbar` (app pages) and `NavAuth` (homepage) — every page below `md`.
- Active section per page: dashboard→dashboard, find-jobs→find-jobs, profile→profile, jobs/[jobId]→find-jobs.

---

## Dashboard Page (Feature 14)

File: `app/dashboard/page.tsx`
Last updated: August 8, 2026

### Page Layout

| Property | Class |
| -------- | ----- |
| Page background | `bg-background` |
| Page wrapper | `flex min-h-screen flex-col bg-background` |
| Navbar | `SiteNavbar` (`components/site-navbar.tsx`) |
| Content container | `mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-10 lg:px-8` |
| Row 1 (stats) | `grid gap-6 sm:grid-cols-2 xl:grid-cols-4` |
| Row 2 & 3 (charts) | `grid gap-6 lg:grid-cols-2` |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm` |

### Stat Card

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md` |
| Label | `text-sm font-medium text-text-secondary` |
| Value | `mt-2 text-3xl font-bold tracking-tight text-text-primary` |
| Trend pill | `mt-2.5 inline-block rounded-full bg-success-lightest px-2.5 py-0.5 text-xs font-medium text-success-darker` (green, e.g. "+12% vs last week") |
| Sub-label | `mt-2.5 text-xs text-text-muted` (e.g. "Total researched") |

### Chart Card

| Property | Class |
| -------- | ----- |
| Card | `rounded-2xl border border-border bg-surface p-6 shadow-sm` |
| Header | `border-b border-border pb-4` |
| Title | `text-base font-semibold text-text-primary` |
| Chart body | `pt-5` |

### Chart Pattern (inline SVG)

| Property | Class |
| -------- | ----- |
| SVG | `viewBox="0 0 560 220" className="w-full" role="img" aria-label=...` |
| Grid line | `<line className="stroke-border" strokeWidth="1" strokeDasharray="4 4" />` |
| Y-axis label | `<text className="fill-text-muted" fontSize="11" textAnchor="end" />` |
| X-axis label | `<text className="fill-text-muted" fontSize="11" textAnchor="middle" />` |
| Bar (research) | `fill-info` (blue `--color-info`) |
| Bar (distribution) | `fill-success` (green `--color-success`) |
| Line (area chart) | `className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"` |
| Area fill | `<linearGradient>` `--color-accent` 0.22 → 0 opacity |
| Chart padding | `PAD_L 40 / PAD_R 8 / PAD_T 12 / PAD_B 30` |

### Activity Timeline

| Property | Class |
| -------- | ----- |
| List | `relative` `ul` with absolute spine `absolute bottom-4 left-2 top-4 w-px bg-border` |
| Item | `relative flex gap-3.5 pb-5 last:pb-0` |
| Dot outer | `relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 ring-surface` + light bg |
| Dot inner | `h-2 w-2 rounded-full` + strong bg |
| Dot colors | `bg-accent-light`/`bg-accent` (emerald), `bg-info-light`/`bg-info` (blue), `bg-success-light`/`bg-success-alt` (green) |
| Title | `text-sm font-medium text-text-primary` |
| Timestamp | `mt-0.5 text-xs text-text-muted` |

**Pattern notes:**
- Charts are hand-rolled inline SVG (no chart lib yet) — spec defers recharts to Feature 17.
- `ChartGrid` / `BarChart` / `AreaLineChart` share `smoothPath()` (quadratic-bezier midpoint smoothing) for the area line.
- Bars have a `hover:opacity-75` micro-interaction; stat cards have `hover:shadow-md`.
- Dashboard is the widest app page: `max-w-7xl` (vs `max-w-5xl` on Find Jobs / Job Details, `max-w-3xl` on Profile).

---

## To Update

Add new component patterns here after building each new feature using the /imprint skill.
