-- Product photos, managed from the admin panel.
--
-- Run after products.sql. Safe to re-run.
--
-- Photos are one ordered list per product. An entry starting with "/" is a file
-- committed to the repo and served with the rest of the site; anything else is
-- a path inside the product-photos bucket, uploaded from the panel. Keeping both
-- shapes in one array is what let this site adopt the panel without moving the
-- 163MB of photos already in git. First entry is the main photo.

alter table public.products
  add column if not exists photos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos', 'product-photos', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read: these are photos on a public shop page. Only an administrator
-- may add or remove one, decided by the same is_admin() the rest of the panel
-- uses — the Worker forwards the caller's own token, so storage enforces this,
-- not application code.
drop policy if exists "product photos are public" on storage.objects;
create policy "product photos are public"
  on storage.objects for select
  using (bucket_id = 'product-photos');

drop policy if exists "admins write product photos" on storage.objects;
create policy "admins write product photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos' and public.is_admin());

drop policy if exists "admins delete product photos" on storage.objects;
create policy "admins delete product photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());
