-- ============================================================
-- Subscriptions Schema
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

create type subscription_tier as enum ('free', 'family', 'pro');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete');

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier subscription_tier default 'free' not null,
  status subscription_status default 'active' not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- Auto-create free subscription on user signup
create or replace function public.handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, tier, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_subscription();

-- Helper: get current user's tier
create or replace function public.get_user_tier(p_user_id uuid default auth.uid())
returns subscription_tier as $$
  select coalesce(
    (select tier from public.subscriptions where user_id = p_user_id and status in ('active', 'trialing')),
    'free'
  );
$$ language sql security definer;
