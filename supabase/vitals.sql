-- ─────────────────────────────────────────────────────────────────
-- VITALS & DAILY WELLNESS LOG
-- Quick-tap logging for mood, water intake, blood pressure, and pain
-- scale — powers the "Right Now" timeline's daily wellness summary.
-- ─────────────────────────────────────────────────────────────────

create table public.vitals (
  id           uuid default uuid_generate_v4() primary key,
  circle_id    uuid references public.care_circles(id) on delete cascade not null,
  logged_by    uuid references auth.users(id) not null,
  kind         text not null check (kind in ('mood', 'water', 'blood_pressure', 'pain')),
  -- mood: 1-5 · water: cumulative glasses (int, stored per-entry as +1) ·
  -- blood_pressure: systolic in value, diastolic in value_secondary ·
  -- pain: 0-10 scale in value
  value          int,
  value_secondary int,
  logged_at    timestamptz default now()
);

alter table public.vitals enable row level security;

create policy "Circle members can read vitals"
  on public.vitals for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can log vitals"
  on public.vitals for insert
  with check (public.is_circle_member(circle_id) and logged_by = auth.uid());

create policy "Loggers can delete their own entries"
  on public.vitals for delete
  using (logged_by = auth.uid());

create index vitals_circle_kind_logged_idx on public.vitals (circle_id, kind, logged_at desc);
