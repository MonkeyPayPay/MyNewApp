-- ─────────────────────────────────────────────────────────────────
-- SCOPED PROFESSIONAL CAREGIVER ROLE
--
-- circle_members.role already includes 'caregiver' in its enum (schema.sql)
-- but nothing ever enforced what it meant. This makes it real: a member
-- with role='caregiver' — a paid home-care aide or professional invited
-- with limited scope — gets tasks, the calendar, and the care feed
-- (their actual job), but never sees the family's expenses, the document
-- vault, or AI Care Advisor insights.
--
-- Naming note: this is unrelated to profiles.care_role (supabase/care_role.sql),
-- which is a *self-description* ("I'm the primary caregiver") used to
-- pick a UI mode. circle_members.role is a *permission level* within one
-- circle. They happen to share the word "caregiver" for different things.
-- ─────────────────────────────────────────────────────────────────

create or replace function public.has_full_circle_access(p_circle_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and role <> 'caregiver'
  );
$$;

-- Expenses: professional-role members are excluded entirely
drop policy if exists "Circle members can read expenses" on public.expenses;
create policy "Full-access members can read expenses"
  on public.expenses for select
  using (public.has_full_circle_access(circle_id));

drop policy if exists "Circle members can add expenses" on public.expenses;
create policy "Full-access members can add expenses"
  on public.expenses for insert
  with check (public.has_full_circle_access(circle_id) and paid_by = auth.uid());

-- Documents: professional-role members are excluded entirely
drop policy if exists "Circle members can read documents" on public.documents;
create policy "Full-access members can read documents"
  on public.documents for select
  using (public.has_full_circle_access(circle_id));

drop policy if exists "Circle members can upload documents" on public.documents;
create policy "Full-access members can upload documents"
  on public.documents for insert
  with check (public.has_full_circle_access(circle_id) and uploaded_by = auth.uid());

-- Invitations: only full-access members can invite others (a professional
-- caregiver shouldn't be able to add people to the family's circle)
drop policy if exists "Circle members can create invitations" on public.invitations;
create policy "Full-access members can create invitations"
  on public.invitations for insert
  with check (public.has_full_circle_access(circle_id));

-- Tasks, appointments, and the care feed are deliberately left open to
-- every circle member regardless of role — coordinating and logging
-- care is exactly what a professional caregiver is there to do.
