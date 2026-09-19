-- Only an administrator may WRITE the catalogue. Run in the LYHOFF SQL editor.
-- Safe to re-run. Written 2026-09-18 after standing up Frontier Lab on this code.
--
-- Why: products.sql granted `authenticated` FOR ALL with `using (true)`, i.e. ANY
-- signed-in user could insert, change or delete products by calling Supabase's REST
-- API with their own token — the Worker's admin check never runs on that path.
-- Customers can sign in on lyhoff.com, so that is every customer.
--
-- Nothing here changes what visitors can READ, so the storefront build is untouched.
-- The admin panel keeps working: it sends the admin's own token, and public.is_admin()
-- is already what pages, site_settings and the photo bucket are gated by.

-- 0. Refuse to continue if is_admin() is missing. Without it the policy below would
--    lock EVERYONE out of editing, including you.
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() does not exist. Stop here and do not run the rest.';
  end if;
end $$;

-- 1. The admin-only policy FIRST, so there is never a moment when nobody can edit.
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products"
  on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Now remove the permissive one.
drop policy if exists "authenticated can manage products" on public.products;

-- 3. What is left on the table. Expected: "admins manage products" (authenticated,
--    ALL, is_admin()) and the read-only policy for anon. Any OTHER row whose roles
--    include authenticated and whose qual is `true` is still a hole.
select policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'products'
order by policyname;

-- 4. Proof, optional. Acts as a signed-in user who is NOT an admin and tries to
--    change a price. Expected: no rows updated. Everything is rolled back either way.
--    Paste this block on its own and run it separately.
--
-- begin;
-- set local role authenticated;
-- set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000000","email":"not-an-admin@example.com","role":"authenticated"}';
-- update public.products set price = price where slug = (select slug from public.products limit 1) returning slug;
-- rollback;
