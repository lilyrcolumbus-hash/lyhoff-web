-- Real inventory. Run after products.sql. Safe to re-run.
--
-- NULL stock means the product is not tracked and always sells, which is where
-- every product starts — adding this column changes nothing until a number goes
-- in it.

alter table public.products
  add column if not exists stock integer;

do $$ begin
  alter table public.products
    add constraint products_stock_not_negative check (stock is null or stock >= 0);
exception when duplicate_object then null;
end $$;

-- Counting down happens in the Stripe webhook, and the webhook only has the anon
-- key — the same key that ships inside the site's own JavaScript. So "callable
-- with the anon key" means "callable by anyone", and an ungated decrement lets a
-- stranger walk the whole catalogue to zero until the shop refuses every sale.
--
-- The caller proves it is the Worker instead. The token lives in a table with RLS
-- on and no policies at all — the most closed a table can be, reachable only from
-- inside a SECURITY DEFINER function.
create table if not exists public.service_tokens (
  name text primary key,
  token text not null,
  created_at timestamptz not null default now()
);
alter table public.service_tokens enable row level security;

-- Generate your own: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
-- then `npx wrangler secret put STOCK_TOKEN` with the same value.
-- insert into public.service_tokens (name, token) values ('stock', 'REPLACE_ME')
-- on conflict (name) do update set token = excluded.token;

create or replace function public.decrement_stock(p_token text, p_slug text, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Does nothing rather than raising: a webhook must never be told why it failed.
  if not exists (
    select 1 from public.service_tokens where name = 'stock' and token = p_token
  ) then
    return;
  end if;

  update public.products
     set stock = greatest(0, stock - greatest(p_quantity, 0))
   where slug = p_slug and stock is not null;
end;
$$;

revoke all on function public.decrement_stock(text, text, integer) from public;
grant execute on function public.decrement_stock(text, text, integer) to anon;
