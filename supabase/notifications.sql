-- ============================================================
-- Notifications Schema
-- Run in Supabase SQL Editor AFTER schema.sql and subscriptions.sql
-- ============================================================

-- ─────────────────────────────────────────
-- NOTIFICATION PREFERENCES
-- ─────────────────────────────────────────
create table public.notification_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email_task_assigned    boolean default true,
  email_feed_entry       boolean default true,
  email_invite_accepted  boolean default true,
  email_expense_added    boolean default false,
  email_weekly_digest    boolean default true,
  digest_day             smallint default 1,  -- 1 = Monday
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can manage own notification preferences"
  on public.notification_preferences for all using (auth.uid() = user_id);

-- Auto-create default prefs on signup
create or replace function public.handle_new_notification_prefs()
returns trigger as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_notif
  after insert on public.profiles
  for each row execute procedure public.handle_new_notification_prefs();


-- ─────────────────────────────────────────
-- NOTIFICATION LOG (dedup + audit trail)
-- ─────────────────────────────────────────
create table public.notification_log (
  id uuid default uuid_generate_v4() primary key,
  user_id   uuid references auth.users(id) on delete cascade,
  type      text not null,
  ref_id    uuid,               -- id of the triggering row
  sent_at   timestamptz default now(),
  unique(user_id, type, ref_id)  -- prevents duplicate sends
);

alter table public.notification_log enable row level security;

create policy "Users can view own notification log"
  on public.notification_log for select using (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- DATABASE WEBHOOKS
-- Set up in Supabase Dashboard → Database → Webhooks → Create new webhook
--
-- Webhook 1: task-assigned
--   Table: tasks  |  Events: INSERT
--   URL: https://<project>.supabase.co/functions/v1/send-notification
--   Headers: Authorization: Bearer <service-role-key>
--
-- Webhook 2: feed-entry-created
--   Table: care_feed_entries  |  Events: INSERT
--   URL: https://<project>.supabase.co/functions/v1/send-notification
--   Headers: Authorization: Bearer <service-role-key>
--
-- Webhook 3: invite-created
--   Table: invitations  |  Events: INSERT
--   URL: https://<project>.supabase.co/functions/v1/send-invite
--   Headers: Authorization: Bearer <service-role-key>
-- ─────────────────────────────────────────
