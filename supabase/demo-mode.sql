-- Read-only demo account for the portfolio admin.
--
-- LYHOFF is a portfolio project, so the live admin doubles as the demo. A public
-- account (see lib/demo.ts) is an admin for READING, so every screen works, but
-- it can never write. The Worker already refuses its admin writes; these
-- triggers refuse them again at the database, so a bug in application code
-- cannot turn the public password into write access.
--
-- Nothing here is scheduled and nothing resets: the data is never changed by
-- the demo account, so there is nothing to put back. Safe to re-run.

create table if not exists public.demo_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.demo_accounts enable row level security;  -- no policies: closed

create or replace function public.is_demo_account()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select exists (select 1 from public.demo_accounts where user_id = auth.uid()); $$;

create or replace function public.block_demo_writes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'demo_read_only' using errcode = '42501';
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'pages', 'site_settings', 'review_submissions',
    'subscribers', 'orders', 'order_notes', 'abandoned_checkouts'
  ] loop
    execute format('drop trigger if exists demo_read_only on public.%I', t);
    execute format(
      'create trigger demo_read_only before insert or update or delete on public.%I
         for each row when (public.is_demo_account()) execute function public.block_demo_writes()',
      t
    );
  end loop;
end $$;

-- The demo account must not see people: customer emails, addresses and order
-- notes stay invisible to it. A RESTRICTIVE policy is ANDed with every existing
-- policy, so this can only narrow what the account sees, never widen it.
do $$
declare
  t text;
begin
  foreach t in array array['subscribers', 'orders', 'order_notes', 'abandoned_checkouts'] loop
    execute format('drop policy if exists demo_cannot_read on public.%I', t);
    execute format(
      'create policy demo_cannot_read on public.%I as restrictive for select to authenticated
         using (not public.is_demo_account())',
      t
    );
  end loop;
end $$;
