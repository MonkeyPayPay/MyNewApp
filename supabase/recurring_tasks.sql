-- ─────────────────────────────────────────────────────────────────
-- RECURRING TASKS / MEDICATION SCHEDULES
-- The biggest gap flagged in the whole-product review: tasks had no
-- way to repeat, so "give Mom her Lisinopril every morning" required
-- manually recreating the task every single day forever.
--
-- Design: `recurring_tasks` holds the template (title, who, how often).
-- A nightly cron (materialize-recurring-tasks Edge Function) creates
-- today's real task row in `tasks` linked back to its template via
-- `recurring_task_id`, so completion state stays per-day and everything
-- downstream (realtime, the Right Now card, task history) works exactly
-- like any other task without special-casing.
-- ─────────────────────────────────────────────────────────────────

create table public.recurring_tasks (
  id           uuid default uuid_generate_v4() primary key,
  circle_id    uuid references public.care_circles(id) on delete cascade not null,
  created_by   uuid references auth.users(id) not null,
  assigned_to  uuid references auth.users(id),
  title        text not null,
  priority     task_priority default 'medium',
  frequency    text not null check (frequency in ('daily', 'weekly')),
  days_of_week int[],  -- 0=Sunday..6=Saturday; used only when frequency='weekly'
  active       boolean default true,
  created_at   timestamptz default now()
);

alter table public.recurring_tasks enable row level security;

create policy "Circle members can read recurring tasks"
  on public.recurring_tasks for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can create recurring tasks"
  on public.recurring_tasks for insert
  with check (public.is_circle_member(circle_id));

create policy "Creators can update recurring tasks"
  on public.recurring_tasks for update
  using (created_by = auth.uid());

create policy "Creators can delete recurring tasks"
  on public.recurring_tasks for delete
  using (created_by = auth.uid());

-- Link materialized daily task rows back to their template
alter table public.tasks add column if not exists recurring_task_id uuid
  references public.recurring_tasks(id) on delete cascade;

-- One occurrence per template per day, so a retried cron run never
-- double-creates today's task
create unique index if not exists tasks_recurring_once_per_day
  on public.tasks (recurring_task_id, due_date)
  where recurring_task_id is not null;
