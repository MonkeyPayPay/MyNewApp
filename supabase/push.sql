-- ─────────────────────────────────────────────────────────────────
-- PUSH NOTIFICATION PLATFORM TRACKING
-- APNs (iOS) and FCM (Android) need different request shapes, so we
-- need to know which one a stored push_token belongs to.
-- ─────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists push_platform text
  check (push_platform in ('ios', 'android'));
