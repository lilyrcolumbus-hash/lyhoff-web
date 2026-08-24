-- LYHOFF website — let a LOGGED-IN customer see and change their own newsletter
-- subscription from the /account page. Run ONCE in the SQL Editor.
--
-- Until now `subscribers` was write-only for the public anon key (see
-- subscribers.sql): the signup form can insert, nobody can read the list. That
-- stays exactly as-is. This migration only adds a second, narrower door for
-- authenticated customers, who can touch ONLY the row matching their own
-- verified email — never anyone else's.
--
-- Same security note as orders.sql: worker.ts MUST query PostgREST with the
-- customer's own access_token for these policies to mean anything. With the
-- shared anon key, auth.jwt() is empty and these policies match nothing.

-- Soft opt-out instead of deleting the row: keeps the historical record of who
-- signed up and when, and stops a re-signup from silently resurrecting someone
-- who deliberately opted out.
alter table public.subscribers
  add column if not exists unsubscribed_at timestamptz;

grant select, update on public.subscribers to authenticated;

drop policy if exists "customers read their own subscription" on public.subscribers;
create policy "customers read their own subscription"
  on public.subscribers
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- The USING clause picks which row they may touch; WITH CHECK re-validates the
-- row AFTER the update, so nobody can rewrite `email` to point at someone else.
drop policy if exists "customers update their own subscription" on public.subscribers;
create policy "customers update their own subscription"
  on public.subscribers
  for update
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create index if not exists subscribers_email_lower_idx on public.subscribers (lower(email));
