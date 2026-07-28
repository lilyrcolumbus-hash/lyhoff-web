-- TEMPORARY — run before scripts/seed-products.mjs, then run the "revert" block
-- right after the script finishes. This exists only so the one-time migration
-- script (which uses the public anon key, same as the rest of the site) can
-- write the initial rows — after that, all writes go through /admin with a
-- real authenticated session instead.

-- STEP 1: run this first, then run `node scripts/seed-products.mjs`
create policy "temp anon seed insert" on public.products
  for insert to anon with check (true);
grant insert on public.products to anon;

-- STEP 2: run this right after the seed script finishes successfully
-- drop policy "temp anon seed insert" on public.products;
-- revoke insert on public.products from anon;
