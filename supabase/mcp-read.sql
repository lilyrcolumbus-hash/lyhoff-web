-- Read access for the MCP server (worker.ts → mcp.ts).
--
-- An MCP client has no Supabase login of its own to forward, unlike the admin
-- panel, where every request carries the caller's own token and Postgres decides.
-- The obvious shortcut would be to hand the Worker a service_role key, but that
-- key bypasses row level security for WRITES as well — an enormous grant for a
-- feature that only ever answers questions.
--
-- So instead: the same shape already used by decrement_stock. Purpose-built
-- functions, SECURITY DEFINER, each gated on a shared token held in
-- service_tokens (RLS on, no policies, so nothing can read the token table
-- itself). The anon key stays the only key the Worker holds, and the blast
-- radius of the token leaking is "someone read the orders", never "someone
-- changed them".
--
-- Products are deliberately absent here: anon already has a read policy on that
-- table, because the storefront is built from it.
--
-- Install the token once (generate it, don't reuse another one):
--   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
--   insert into public.service_tokens (name, token) values ('mcp', 'REPLACE_ME')
--   on conflict (name) do update set token = excluded.token;
-- then `npx wrangler secret put MCP_DB_TOKEN` with the same value.

create or replace function public.mcp_orders(p_token text)
returns setof public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- An empty set rather than an error: a caller with the wrong token learns
  -- nothing about whether the table exists or how many rows it holds.
  if not exists (
    select 1 from public.service_tokens where name = 'mcp' and token = p_token
  ) then
    return;
  end if;

  return query select * from public.orders order by created_at desc limit 1000;
end;
$$;

create or replace function public.mcp_reviews(p_token text)
returns setof public.review_submissions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.service_tokens where name = 'mcp' and token = p_token
  ) then
    return;
  end if;

  return query select * from public.review_submissions order by created_at desc limit 500;
end;
$$;

create or replace function public.mcp_subscribers(p_token text)
returns setof public.subscribers
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.service_tokens where name = 'mcp' and token = p_token
  ) then
    return;
  end if;

  return query select * from public.subscribers order by created_at desc limit 2000;
end;
$$;

create or replace function public.mcp_abandoned(p_token text)
returns setof public.abandoned_checkouts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.service_tokens where name = 'mcp' and token = p_token
  ) then
    return;
  end if;

  return query select * from public.abandoned_checkouts order by created_at desc limit 500;
end;
$$;

revoke all on function public.mcp_orders(text) from public;
revoke all on function public.mcp_reviews(text) from public;
revoke all on function public.mcp_subscribers(text) from public;
revoke all on function public.mcp_abandoned(text) from public;

grant execute on function public.mcp_orders(text) to anon;
grant execute on function public.mcp_reviews(text) to anon;
grant execute on function public.mcp_subscribers(text) to anon;
grant execute on function public.mcp_abandoned(text) to anon;
