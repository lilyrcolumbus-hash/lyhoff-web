-- Checkouts that were started and never paid. Run after orders.sql. Safe to re-run.
--
-- Nothing about anyone's browser is tracked to make this work. Stripe already
-- knows the checkout expired, already holds the basket, and already mints a link
-- that restores it — the Checkout Session is created with
-- `after_expiration.recovery.enabled`. This table exists so she can see it
-- happened and so the reminder is sent exactly once.

create table if not exists public.abandoned_checkouts (
  id text primary key,
  email text not null,
  customer_name text,
  amount_total integer not null default 0,
  currency text not null default 'usd',
  items jsonb not null default '[]'::jsonb,
  recovery_url text,
  locale text,
  emailed_at timestamptz,
  -- Set when Stripe reports a paid session with `recovered_from` pointing here.
  recovered_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.abandoned_checkouts enable row level security;

-- The webhook writes with the anon key, exactly like orders: it may insert and
-- mark one recovered, and can never read the list back. The primary key is what
-- makes a retried webhook a no-op instead of a second email — which is also why
-- the Worker inserts the row *before* sending anything.
drop policy if exists "webhook records abandoned checkouts" on public.abandoned_checkouts;
create policy "webhook records abandoned checkouts"
  on public.abandoned_checkouts for insert to anon with check (true);

drop policy if exists "webhook marks recovered" on public.abandoned_checkouts;
create policy "webhook marks recovered"
  on public.abandoned_checkouts for update to anon using (true) with check (true);

drop policy if exists "admins read abandoned checkouts" on public.abandoned_checkouts;
create policy "admins read abandoned checkouts"
  on public.abandoned_checkouts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant insert, update on public.abandoned_checkouts to anon;
grant select, insert, update, delete on public.abandoned_checkouts to authenticated;
