-- LYHOFF website — newsletter subscribers.
-- Own dedicated Supabase project (org "LYHOFF"), no longer shared with SmartGrowth.
-- Run ONCE in the new project → SQL Editor → Run.
-- After this, the signup form on the website stores emails here (you own the list).

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  locale     text default 'en',
  source     text default 'lyhoff-web',
  created_at timestamptz default now()
);

alter table public.subscribers enable row level security;

-- Allow the public signup form (anon key) to INSERT only.
-- There is NO select policy for anon → nobody can read the list with the public
-- key. You read/export subscribers from the Supabase dashboard (Table editor).
grant insert on public.subscribers to anon;

drop policy if exists "anon can insert subscribers" on public.subscribers;
create policy "anon can insert subscribers"
  on public.subscribers
  for insert
  to anon
  with check (true);
