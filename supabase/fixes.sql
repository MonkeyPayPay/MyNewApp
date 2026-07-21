-- ─────────────────────────────────────────────────────────────────
-- SECURITY & CORRECTNESS FIXES — run after schema.sql
-- ─────────────────────────────────────────────────────────────────

-- 1. Profiles were only visible to their owner, but the app joins
--    profiles(full_name) everywhere (tasks, feed, expenses, documents,
--    member lists). Allow circle co-members to see each other's profiles.
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Users and circle co-members can view profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.circle_members me
      join public.circle_members them on them.circle_id = me.circle_id
      where me.user_id = auth.uid()
        and them.user_id = public.profiles.id
    )
  );

-- 2. Profiles had no INSERT policy, so the Onboarding upsert
--    (profiles.upsert on name save) failed RLS silently.
--    The row normally exists via the signup trigger; this makes the
--    upsert path legal too.
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Push notification device token storage (used by
--    usePushNotifications). Opaque token — sending still requires the
--    server-side APNs/FCM credentials.
alter table public.profiles add column if not exists push_token text;
