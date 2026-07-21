-- ─────────────────────────────────────────────────────────────────
-- FUNNEL ANALYTICS — self-hosted, $0, privacy-respecting
-- Write-only from the client; readable only via SQL editor / service role.
-- ─────────────────────────────────────────────────────────────────

create table public.events (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null,
  event      text not null,
  props      jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

-- Anonymous visitors must be able to log page views; no client may read.
create policy "Anyone can insert events"
  on public.events for insert
  to anon, authenticated
  with check (true);

create index events_event_created_idx on public.events (event, created_at);

-- ─────────────────────────────────────────────────────────────────
-- FUNNEL QUERY — run in the SQL editor to check the validation gates
-- (see docs/STRATEGY.md §6 for the decision thresholds)
-- ─────────────────────────────────────────────────────────────────
-- select event, count(*) as total, count(distinct user_id) as users
-- from events
-- where created_at > now() - interval '30 days'
--   and event in ('page_view', 'signup', 'circle_created', 'invite_sent',
--                 'invite_accepted', 'checkout_started', 'trial_started')
-- group by event
-- order by array_position(
--   array['page_view','signup','circle_created','invite_sent',
--         'invite_accepted','checkout_started','trial_started'], event);
