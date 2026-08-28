-- Pages composed from blocks in the panel. Run after products.sql. Safe to re-run.
--
-- Blocks and not a code editor, deliberately: Shopify can offer a template
-- editor because a broken template renders one bad page, but on a statically
-- exported site a syntax error fails the build and nothing publishes at all. A
-- fixed set of block types cannot take the site down.

create table if not exists public.pages (
  slug text primary key,
  title jsonb not null default '{"en":"","es":""}'::jsonb,
  blocks jsonb not null default '[]'::jsonb,
  seo jsonb,
  active boolean not null default false,
  position integer default 999,
  updated_at timestamptz not null default now()
);
alter table public.pages enable row level security;

-- The site is built with the anon key, so it has to be able to read them.
-- Only published pages are built — see scripts/fetch-pages.mjs. A draft never
-- reaches the CDN, where being unlinked would not make it private.
drop policy if exists "anyone can read pages" on public.pages;
create policy "anyone can read pages" on public.pages for select using (true);

drop policy if exists "admins manage pages" on public.pages;
create policy "admins manage pages" on public.pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
