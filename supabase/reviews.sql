-- LYHOFF website — customer-submitted reviews, collected directly on the site
-- (no third-party app). Same dedicated Supabase project as subscribers.sql/products.sql.
-- Run ONCE in the SQL Editor.
--
-- Flow: customer submits via the form on /gracias (or later, a product page) →
-- lands here with approved = false → owner reviews in the Supabase Table editor
-- and flips approved = true for the ones she wants live → those still need to be
-- copied into lib/products.ts's `reviews` field by hand and redeployed, same as
-- the reviews already on the site today (this table only fixes COLLECTION, not
-- auto-publishing — that needs the same build-time-fetch pipeline already
-- planned for the product admin panel, see project_admin_panel_progress memory).

create table if not exists public.review_submissions (
  id         uuid primary key default gen_random_uuid(),
  slug       text,               -- product slug, nullable (a general LYHOFF review)
  rating     smallint not null check (rating between 1 and 5),
  author     text not null,
  location   text,
  text       text not null,
  locale     text default 'en',
  approved   boolean not null default false,
  created_at timestamptz default now()
);

alter table public.review_submissions enable row level security;

-- Public submission form (anon key) can INSERT only — no select policy for
-- anon, so nobody can read other customers' submitted reviews with the public
-- key. Owner reads/approves from the Supabase dashboard (Table editor).
grant insert on public.review_submissions to anon;

drop policy if exists "anon can submit reviews" on public.review_submissions;
create policy "anon can submit reviews"
  on public.review_submissions
  for insert
  to anon
  with check (true);
