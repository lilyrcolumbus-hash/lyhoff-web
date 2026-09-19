-- LYHOFF website — product catalog, self-service admin backing store.
-- Same Supabase project as subscribers.sql (org "LYHOFF", project "lyhoff-web").
-- Run ONCE in the SQL Editor. After this, products are edited via /admin instead
-- of lib/products.ts, and fetched at build time by scripts/fetch-products.mjs.

create table if not exists public.products (
  slug          text primary key,
  asin          text,
  category      text not null,
  name          jsonb not null,       -- { en, es }
  tagline       jsonb not null,       -- { en, es }
  description   jsonb not null,       -- { en, es }
  ingredients   jsonb not null default '[]', -- [{ en, es }]
  price         numeric not null,
  size          text not null,
  image         text not null,
  badge         jsonb,                -- { en, es } | null
  active        boolean not null default false,
  variant_group text,
  scent         text,
  scent_group   text,
  benefits      jsonb not null default '[]', -- [{ en, es }]
  how_to_use    jsonb not null,       -- { en, es }
  reviews       jsonb not null default '[]', -- [{ text: { en, es }, author, location }]
  gift          jsonb,                -- { en, es } | null
  updated_at    timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public catalog data — same trust level as today's static site, where every
-- product is already visible to any visitor. anon can only READ.
drop policy if exists "anon can read products" on public.products;
create policy "anon can read products"
  on public.products
  for select
  to anon
  using (true);

grant select on public.products to anon;

-- Only her logged-in admin session (authenticated role) can write.
-- SECURITY WARNING (2026-09-18): the policy below lets ANY signed-in user (every customer)
-- write products. Run supabase/products-admin-only.sql after this file. It is not folded
-- in here because products.sql runs before public.is_admin() exists in this repo's order.
drop policy if exists "authenticated can manage products" on public.products;
create policy "authenticated can manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.products to authenticated;

-- Keep updated_at current on every edit.
create or replace function public.set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();
