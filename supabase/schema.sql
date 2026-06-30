-- ============================================================
-- CareCircle Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────
-- CARE RECIPIENTS
-- ─────────────────────────────────────────
create table public.care_recipients (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  date_of_birth date,
  photo_url text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.care_recipients enable row level security;


-- ─────────────────────────────────────────
-- CARE CIRCLES
-- ─────────────────────────────────────────
create table public.care_circles (
  id uuid default uuid_generate_v4() primary key,
  care_recipient_id uuid references public.care_recipients(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

alter table public.care_circles enable row level security;


-- ─────────────────────────────────────────
-- CIRCLE MEMBERS
-- ─────────────────────────────────────────
create type member_role as enum ('owner', 'admin', 'member', 'caregiver');

create table public.circle_members (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role member_role default 'member',
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

alter table public.circle_members enable row level security;

-- Members can see other members in their circle
create policy "Members can view circle members"
  on public.circle_members for select
  using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = circle_members.circle_id
        and cm.user_id = auth.uid()
    )
  );

-- Helper: is the current user in a given circle?
create function public.is_circle_member(p_circle_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = p_circle_id and user_id = auth.uid()
  );
$$ language sql security definer;


-- ─────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  invited_by uuid references auth.users(id) not null,
  email text not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  role member_role default 'member',
  accepted_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

alter table public.invitations enable row level security;

create policy "Circle members can create invitations"
  on public.invitations for insert
  with check (public.is_circle_member(circle_id));

create policy "Circle members can view invitations"
  on public.invitations for select
  using (public.is_circle_member(circle_id));


-- ─────────────────────────────────────────
-- CARE FEED ENTRIES
-- ─────────────────────────────────────────
create type feed_category as enum (
  'medication', 'medical', 'personal', 'note',
  'nutrition', 'activity', 'incident', 'financial'
);

create table public.care_feed_entries (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  author_id uuid references auth.users(id) not null,
  category feed_category not null default 'note',
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.care_feed_entries enable row level security;

create policy "Circle members can read feed"
  on public.care_feed_entries for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can insert feed entries"
  on public.care_feed_entries for insert
  with check (public.is_circle_member(circle_id) and author_id = auth.uid());

create policy "Authors can update their own entries"
  on public.care_feed_entries for update
  using (author_id = auth.uid());

create policy "Authors can delete their own entries"
  on public.care_feed_entries for delete
  using (author_id = auth.uid());


-- ─────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────
create type task_priority as enum ('high', 'medium', 'low');

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  assigned_to uuid references auth.users(id),
  title text not null,
  priority task_priority default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Circle members can read tasks"
  on public.tasks for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can create tasks"
  on public.tasks for insert
  with check (public.is_circle_member(circle_id) and created_by = auth.uid());

create policy "Circle members can update tasks"
  on public.tasks for update
  using (public.is_circle_member(circle_id));

create policy "Task creators can delete tasks"
  on public.tasks for delete
  using (created_by = auth.uid());


-- ─────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  paid_by uuid references auth.users(id) not null,
  label text not null,
  amount_cents integer not null,
  category text,
  expense_date date default current_date,
  split_equally boolean default true,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Circle members can read expenses"
  on public.expenses for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can add expenses"
  on public.expenses for insert
  with check (public.is_circle_member(circle_id) and paid_by = auth.uid());

create policy "Expense owners can update"
  on public.expenses for update
  using (paid_by = auth.uid());

create policy "Expense owners can delete"
  on public.expenses for delete
  using (paid_by = auth.uid());


-- ─────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  uploaded_by uuid references auth.users(id) not null,
  name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  ai_summary text,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Circle members can read documents"
  on public.documents for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can upload documents"
  on public.documents for insert
  with check (public.is_circle_member(circle_id) and uploaded_by = auth.uid());

create policy "Uploaders can delete documents"
  on public.documents for delete
  using (uploaded_by = auth.uid());


-- ─────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.care_circles(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  title text not null,
  location text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Circle members can read appointments"
  on public.appointments for select
  using (public.is_circle_member(circle_id));

create policy "Circle members can create appointments"
  on public.appointments for insert
  with check (public.is_circle_member(circle_id) and created_by = auth.uid());

create policy "Creators can update appointments"
  on public.appointments for update
  using (created_by = auth.uid());

create policy "Creators can delete appointments"
  on public.appointments for delete
  using (created_by = auth.uid());


-- ─────────────────────────────────────────
-- STORAGE BUCKET for documents
-- ─────────────────────────────────────────
-- Run this separately in Storage → New Bucket:
-- Name: documents
-- Private: YES (not public)

-- Storage policy (run in SQL Editor):
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- create policy "Members can upload to their circle folder"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'documents'
--     and auth.uid() is not null
--   );

-- create policy "Members can read their circle documents"
--   on storage.objects for select
--   using (bucket_id = 'documents' and auth.uid() is not null);
