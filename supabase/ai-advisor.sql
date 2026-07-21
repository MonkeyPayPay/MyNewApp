-- AI insights cache table
-- Caches Claude-generated insights per circle for 24 hours to control API costs
create table if not exists ai_insights (
  id           uuid primary key default gen_random_uuid(),
  circle_id    uuid not null references care_circles(id) on delete cascade,
  insights     jsonb not null default '[]',
  generated_at timestamptz not null default now(),
  unique (circle_id)
);

alter table ai_insights enable row level security;

-- Only circle members can read their own circle's insights
create policy "circle members can read insights"
  on ai_insights for select
  using (
    exists (
      select 1 from circle_members
      where circle_members.circle_id = ai_insights.circle_id
        and circle_members.user_id = auth.uid()
    )
  );

-- Edge Function uses service role key — no insert policy needed for anon/authenticated
-- (service role bypasses RLS)
