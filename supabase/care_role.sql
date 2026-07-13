-- ─────────────────────────────────────────────────────────────────
-- CARE ROLE
-- Distinguishes the primary caregiver / a helping family member / the
-- person actually receiving care, so the dashboard can show the right
-- amount of complexity for each. Nullable — existing accounts are
-- unaffected until they're asked (they won't be re-onboarded).
-- ─────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists care_role text
  check (care_role in ('caregiver', 'helper', 'recipient'));
