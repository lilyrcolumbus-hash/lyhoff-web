-- What it takes to pack and post an order without opening Stripe.
-- Run after orders.sql. Safe to re-run.

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists shipping_address jsonb;

-- A note about a customer is not for the customer, and their own policy lets
-- them read their whole order row — so the note cannot live on that row. It
-- goes somewhere they have no policy at all.
--
-- Column-level privileges are not the fix here: the admin reads orders as an
-- ordinary `authenticated` user too, so revoking a column from that role locks
-- out the person the column is for. Their power comes from a policy, not a role.
create table if not exists public.order_notes (
  order_id text primary key references public.orders(id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.order_notes enable row level security;

drop policy if exists "admins manage order notes" on public.order_notes;
create policy "admins manage order notes"
  on public.order_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Per-product search title and description. Left empty, the product's own name
-- and description are used, which is the right default — so this is opt-in.
alter table public.products
  add column if not exists seo jsonb;
