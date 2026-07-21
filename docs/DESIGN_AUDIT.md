# CareCircle — Design System Audit

*Pass 0 of the flagship design upgrade. Findings only — no code changed yet.*

## The root cause

`tailwind.config.js` defines zero design tokens — no custom colors, spacing, or
border-radius scale. `index.css` defines only presentational one-offs (`.glass`,
`.glow-purple`, `.orb`). Every radius, spacing, and color decision in the app is
made ad hoc, per component, via raw Tailwind utilities or repeated hex codes.
That's the single root cause behind nearly every inconsistency below — there is
no system to drift from, so every component invented its own.

## Findings, by category

**1. Corner radius** — `rounded-lg`(19) / `rounded-xl`(98) / `rounded-2xl`(69) /
`rounded-3xl`(11) / `rounded-full`(57) coexist with no rule. Two different
"dialog card" radii: in-view modals (Tasks/Expenses/Feed/Calendar's "New X")
use `rounded-2xl`, but standalone modals (Invite, Upgrade, UpgradeSuccess) use
`rounded-3xl` — same role, different shape. Gradient icon badges vary between
`rounded-lg`, `rounded-xl`, and `rounded-2xl` across three files for the
identical "icon in a colored square" pattern.

**2. Spacing** — `p-3`/`p-4`/`p-5`/`p-6` all appear on sibling elements. Primary
button padding alone has three values in active use: `py-3` (five modal Save
buttons), `py-3.5` (Onboarding/Auth), `py-4` (UpgradeModal) — for the same
"main CTA" role.

**3. Typography** — Mostly consistent (`text-white font-bold text-lg` for
in-view modal titles, five files agree), but `UpgradeModal` breaks it with
`<h2 className="font-black text-xl">` — different tag, size, *and* weight for
the same "modal title" job. `font-black` appears in exactly two places in the
whole app, both accidental-looking outliers rather than an intentional emphasis
tier.

**4. Touch targets** — The close ("X") button has **no consistent hit target
across 7 modal implementations**. Six of seven render a bare `<button>` with no
width/height/padding at all — the actual tappable area is just the icon glyph,
roughly 20×20px, well under the 44×44px accessibility minimum. Only
`DetailSlideOver` gives it an explicit `w-11 h-11` target. This is the most
concrete, fixable accessibility finding in the audit.

**5. Icon sizing** — `w-4 h-4` and `w-5 h-5` dominate but aren't rule-bound: the
same dismiss "X" icon is `w-5 h-5` in six modals and `w-6 h-6` in one.

**6. Color** — Two near-identical brand gradients coexist with no rule for
which is used where: `from-indigo-600 to-purple-600` (23 uses, mostly CTAs) vs
`from-indigo-500 to-purple-600` (8 uses, mostly icon badges) — a one-shade
drift that reads as a mistake, not a choice. Worse: **three different
near-black background hex values** stand in for one "dark theme" —
`#050510` (13 places), `#0a0a1a` (Dashboard/RecipientDashboard), `#1a1a2e`
(a date-picker override) — none as a token, all copy-pasted.

**7. Motion — a real two-tier app.** Only six files use `framer-motion`, and
they're all concentrated in the newer `care/` dashboard widgets (LiveStatusHeader,
CareTimeline, QuickCapture, QuickVitalsLog, FlyToContext) plus `DetailSlideOver`.
Every other screen — Tasks, Expenses, Feed, Calendar, Documents, AI Advisor,
Invite, Upgrade, the entire Landing page — has zero JS-driven motion, relying
only on static CSS `transition-colors`. The app currently has one beautifully
animated corner and a plain, static everything-else. This is the biggest
visual-quality gap, not just a consistency one.

**8. Loading states** — Actually solid: all six dashboard views correctly pair
skeleton `animate-pulse` blocks with spinner button states. No gap here.

**9. Empty states** — Consistent across Tasks/Expenses/Feed (same shell, same
copy pattern, same CTA link) with one outlier: **Documents' empty state is
missing its CTA** — same icon and heading as the other three, but no "upload
the first document →" link, so it's a dead end where its siblings aren't.

**10. Tokens** — Confirmed zero color/spacing/radius extensions in
`tailwind.config.js`. Everything above is a symptom of this.

## What this means for the upgrade

The fix isn't 40 individual component tweaks — it's building the missing
system once (tokens + a handful of shared primitives: Button, IconButton,
Modal shell, Card) and then pointing every screen at it. That collapses most
of findings 1–6 in one pass, closes finding 4 (accessibility) by construction,
and gives the motion pass (finding 7) one set of animated primitives to wire
in rather than six-plus screens to hand-animate individually.

## Proposed pass order

1. **Design system foundation** — tokens in `tailwind.config.js`, shared
   `Button`/`IconButton`/`Modal`/`Card` primitives with built-in 44px touch
   targets and consistent motion.
2. **Visual polish** — repoint every screen at the new primitives; fix the
   Documents empty-state gap; consolidate the two gradients and three
   background blacks into one each.
3. **Animation & micro-interactions** — extend the `care/` widgets' motion
   language (physics-based easing, entrance/exit, tap feedback) to every
   remaining screen via the shared primitives.
4. **Accessibility & responsiveness** — contrast check, dynamic-type check,
   breakpoint sweep.
5. **Final consistency pass** — screen-by-screen diff against the system.

I'll report back with a concrete summary after each pass, not one silent
rewrite.
