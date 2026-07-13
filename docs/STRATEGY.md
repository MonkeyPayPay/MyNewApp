# CareCircle — Strategy & Engineering Audit

*Last updated: July 2026. Numbers marked (est.) are estimates from public
research, not guarantees. This document is deliberately honest — it exists
to make good decisions, not to feel good.*

---

## 1. Executive Summary

CareCircle is a family caregiving coordination app: shared care log, tasks,
calendar, expense splitting, document vault with AI summaries, and an AI
care advisor. Freemium SaaS (Free / Family $9.99–12.99 / Pro $24.99–29.99),
built on a near-zero-fixed-cost stack (Vite + Supabase + Vercel + Stripe +
Resend + Anthropic). Web, PWA, iOS, and Android from one codebase.

**The honest bar**: a $100M valuation at typical SaaS multiples requires
roughly $10–15M ARR — about 100,000 paying subscribers at ~$10/month. The
product is built; the open question is willingness to pay, and that is
testable for under $500 (see §6).

## 2. Market (est.)

- ~53M US adults provide unpaid care to an adult or child (AARP/NAC,
  most recent major study). ~48M care for adults 50+.
- Family caregivers report ~$7,200/yr average out-of-pocket spend (AARP) —
  which is exactly what the expense-splitting feature touches.
- Demographic tailwind is real: peak boomer caregiving demand runs through
  the 2030s; the "sandwich generation" (caring for parents and kids) is
  the buyer — typically a 45–60 year old adult child, often the eldest
  daughter, coordinating 2–5 siblings.
- Serviceable framing: if 40M US caregiving households are addressable and
  1% convert at ~$120/yr, that's ~$48M ARR. That 1% is the entire game.

**Why now**: AI is the step-change legacy competitors don't have (document
summarization, pattern detection over care logs), and Supabase-era
infrastructure makes the unit economics work at $0 fixed cost.

## 3. Competitive Landscape — and the Graveyard

This space is **not** empty. Be clear-eyed about it:

| Competitor | Positioning | Weakness |
|---|---|---|
| Ianacare | Free caregiver support network, pivoted B2B2C (employers/health plans) | Consumer product de-prioritized; no expense splitting |
| CaringBridge | Health-update journaling (nonprofit) | Broadcast, not coordination; no tasks/expenses; dated |
| Lotsa Helping Hands | Community help calendar | Legacy UX; calendar-only; no mobile-first experience |
| CircleOf / Caring Village / Carely | Care-circle coordination apps | Thin feature sets, several stagnant or shut down; no AI |
| Group chat + shared calendar + Splitwise | What families actually use today | Fragmented across 3–4 apps — this is the real competitor |

**The graveyard lesson**: several well-funded attempts stalled because
individual caregivers resist paying for "organization" apps. The two
mitigations built into CareCircle: (a) the payer is the *family* splitting
real money (expenses), which anchors the subscription to dollars, not
vibes; and (b) B2B2C (employers, senior-living, discharge planners) is the
proven revenue path in this category — the Enterprise CTA on the landing
page should be treated as a first-class funnel, not decoration.

## 4. Moat & Growth Loops

- **Built-in virality**: the product is unusable alone — creating a circle
  *requires* inviting family. Every activated user recruits 2–5 more.
  This is the single most important metric to instrument (see §6).
- **Switching costs**: the care log is an irreplaceable longitudinal
  record. After 6 months, leaving means losing the family's medical
  memory. Data export (already built: CSV) is ethically required and
  doesn't meaningfully weaken this.
- **AI compounding**: the advisor gets better with more logged data; the
  document vault becomes a searchable health record. Neither is
  replicable by a group chat.
- **What is NOT a moat**: features. Everything in the app can be cloned
  in a quarter. Distribution + accumulated data are the moat.

## 5. Unit Economics (est.)

- Infra at low scale: ~$0–25/mo (Supabase free tier, Vercel hobby,
  Resend free tier). At 10K MAU: roughly $100–300/mo.
- Marginal AI cost: document summary ≈ fractions of a cent (Haiku);
  advisor insights cached 24h per circle — cost scales with circles, not
  members. Gross margin at scale: 90%+.
- 14-day trial on paid tiers; annual pricing (23% discount) is the
  default toggle — annual prepay is the cash-flow engine.

## 6. Validation Plan — under $500, 30 days

The product is live (my-new-app-lyart.vercel.app). Validate demand before
spending anything on more features:

1. **Week 1 — instrument**: add a privacy-respecting analytics tool
   (PostHog free tier / Vercel Analytics). Funnel: visit → signup →
   circle created → **first invite sent** → invite accepted → D7 return.
2. **Weeks 1–4 — organic**: post genuinely useful content (not ads) in
   r/AgingParents, r/CaregiverSupport, caregiver Facebook groups. Cost: $0.
   Offer 10 families free Family-tier for feedback calls.
3. **Weeks 2–4 — paid probe**: ~$300 Meta ads targeted at women 45–60
   interested in eldercare. Landing page already converts by design.
4. **Decision gates** (pick before you look at the data):
   - Visitor → signup ≥ 4%
   - Signup → invite sent ≥ 30%
   - Invite → acceptance ≥ 40%
   - Any organic willingness-to-pay signal (trial starts)
   - If invites-per-circle < 1.5, the viral loop is broken — fix that
     before spending another dollar on acquisition.

## 7. Engineering Audit (July 2026)

### Fixed in this pass
- 🔴 **`send-invite` had no authentication** — any caller could redirect an
  invite token to their own email and join a family's circle (full access
  to health data). Now: JWT + circle-membership check on the direct path,
  `x-webhook-secret` on the webhook path, and the destination email is
  always read from the database, never the request.
- 🔴 **`summarize-document` had no authentication** — AI summaries of
  medical documents were retrievable by document ID. Now: JWT + membership.
- 🔴 **Profiles RLS was owner-only** — every `profiles(full_name)` join in
  the app returned null for other members, and the onboarding name-save
  upsert failed silently (no INSERT policy). Fixed in `supabase/fixes.sql`.
- 🟡 **`send-notification` / `weekly-digest`** were publicly invokable
  (email spam/phishing vector from CareCircle's sender). Now gated by
  `WEBHOOK_SECRET` when configured.
- 🟡 **SETUP.md documented wrong Stripe secret names** (functions read
  `STRIPE_PRICE_FAMILY_MONTHLY` etc.). Corrected.

### Also fixed (second pass)
- CORS tightened from `*` to an origin allowlist (`_shared/cors.ts`:
  APP_URL + Capacitor WebView origins + local dev).
- Android hardware back button now navigates back; exits only at the root.
- Uploads bounded at 10MB with inline error UI; `summarize-document`
  skips AI for oversized files server-side.
- HIPAA claims removed from Hero, Pricing, Testimonials, Footer, and the
  upgrade modal (privacy.html/terms.html already disclaimed correctly).
  Revisit only with counsel and signed vendor BAAs.
- Funnel analytics shipped: write-only `events` table
  (supabase/analytics.sql) + `track()` helper wired to page_view, signup,
  circle_created, invite_sent, invite_accepted, checkout_started,
  trial_started. Funnel query included in the SQL file.
- Test suite added (vitest, `npm test`): paywall gating
  (`src/lib/entitlements.js`) and CSV export escaping (`src/lib/csv.js`).

### Known remaining (accepted for now)
- RLS policies untested by automation; pgTAP harness is the eventual home.

### Whole-product review (see the published artifact for full detail)
A follow-up executive/design/engineering/customer review was done against
the live product. Fixes already landed from it: removed the beta badge and
fabricated testimonials/trust stats; removed the unenforced free-tier
member cap (was fighting the product's own invite-driven growth loop);
cut Pro-tier pricing claims for features that didn't exist; added real
document-vault quota enforcement; added an ambient tier + trial-countdown
chip; added a quick-capture button to the Right Now timeline; and built
push notification *sending* (APNs direct + FCM HTTP v1, JWT-signed via
Deno's Web Crypto — see `supabase/functions/_shared/push.ts`), wired into
task-assigned and care-feed-entry events. **Unverified against real
devices** — the token signing is correct per each platform's documented
format, but needs a real APNs key / Firebase project to confirm delivery.

Since then, also landed: a "who are you" onboarding step + a narrower
RecipientDashboard for the person actually receiving care; AI Care
Advisor insights surfaced inline in the Right Now card (gated so it never
fires a paid AI call for anyone not entitled to it); photo receipts on
expenses and document linking on appointments; recurring tasks /
medication schedules (recurring_tasks template + nightly materialization
cron — the data-model fix this category needed most); and a scoped
professional-caregiver circle role (`circle_members.role = 'caregiver'`,
enforced via RLS + Edge Function checks) that finally gives the Pro tier
a real, defensible differentiator — tasks and the calendar only, no
expenses, documents, or AI insights.

Still open: splitting `Dashboard.jsx` before it gets more expensive to
touch, and a Playwright smoke test over the core signup → circle → task
loop.

### Accessibility-focused dashboard redesign
The home dashboard was rebuilt around a senior-friendly interaction model:
a single "Right Now / Next" timeline (replaces the old 4-stat-card grid),
a Dynamic-Island-style status header, oversized tap targets (56px+) for
vitals logging (mood, water, blood pressure, pain scale) instead of text
inputs, and slide-over panels instead of full-screen modals so context is
never lost. Motion uses calm ease-out curves (no snappy overshoot) and
respects `prefers-reduced-motion`. New: `supabase/vitals.sql` (quick-log
table), `src/hooks/useVitals.js`, `src/lib/haptics.js` (native tap/success
feedback via `@capacitor/haptics`), and `src/components/dashboard/care/*`.
Not yet done: this hasn't been visually verified in a real browser session
(sandbox has no Supabase auth credentials) — validate on a real account
before shipping to users, particularly the sticky-header scroll behavior
and VoiceOver/TalkBack pass over the new tap targets.

## 8. Roadmap (sequenced by evidence, not ambition)

1. **Now → validation gate**: instrument funnel, run §6. Build nothing new.
2. **If validation passes**: push-notification sending, medication
   schedules + reminders (the #1 caregiving feature request in every
   competitor's reviews), App Store / Play Store submission.
3. **Revenue expansion**: B2B2C pilot — senior-living communities and
   hospital discharge planners buying seats for families (this is where
   the category's real money has historically been).
4. **Only at scale**: professional caregiver portal (Pro tier), health
   records integration, HIPAA program with counsel.
