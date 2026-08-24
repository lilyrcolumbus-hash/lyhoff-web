-- LYHOFF website — order history for the new customer login/account system.
-- Same dedicated Supabase project as subscribers.sql/reviews.sql/products.sql.
-- Run ONCE in the SQL Editor.
--
-- Populated ONLY by the Stripe webhook (checkout.session.completed) in worker.ts,
-- never by the client directly. Guest checkout is unaffected — an order still
-- gets a row here even if `user_id` is null (nobody was logged in at checkout).
-- Only orders placed on lyhoff.com's own Stripe account ever land here — Etsy/
-- TikTok Shop orders never touch this table, same reason THANKYOU15 reads them
-- as "first-time" customers (see CLAUDE.md's 2026-08-08 entry).

create table if not exists public.orders (
  id           text primary key,              -- Stripe Checkout Session ID (cs_...)
  user_id      uuid,                           -- auth.users.id, null for guest orders
  email        text not null,
  amount_total integer not null,               -- cents
  currency     text not null default 'usd',
  items        jsonb not null default '[]',    -- snapshot: [{ name, quantity, amount_total }]
  locale       text default 'en',
  created_at   timestamptz not null default now()
);

alter table public.orders enable row level security;

-- The webhook writes with the anon key (same as subscribers/review_submissions)
-- — insert-only, no anon select, so the public key can never read other
-- customers' order data.
grant insert on public.orders to anon;

drop policy if exists "anon can insert orders" on public.orders;
create policy "anon can insert orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- Logged-in customers can read ONLY their own orders. This is the real
-- security boundary of the account feature — worker.ts's /api/account/orders
-- MUST query PostgREST with the customer's own Supabase access_token here,
-- not the shared anon key, or auth.uid()/auth.jwt() won't resolve and this
-- policy silently returns nothing instead of actually enforcing anything.
grant select on public.orders to authenticated;

drop policy if exists "customers read their own orders" on public.orders;
create policy "customers read their own orders"
  on public.orders
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_email_idx on public.orders (lower(email));
