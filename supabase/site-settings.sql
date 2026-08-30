-- One key/value store behind every screen that isn't products or orders:
-- shipping, business details, palette, navigation and the storefront's wording.
-- Run after products.sql. Safe to re-run.
--
-- Separate rows rather than one document, so two screens edited at once cannot
-- overwrite each other. Read at BUILD time like everything else: a shipping rate
-- that could change between the page being rendered and the payment being taken
-- is exactly the drift this architecture exists to prevent.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "anyone can read settings" on public.site_settings;
create policy "anyone can read settings"
  on public.site_settings for select using (true);

drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The policy alone is not enough — the role also needs the table privilege.
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- Seed with what the code already compiles in, so the first publish after this
-- changes nothing at all. Every key falls back to its compiled default when the
-- row is missing, so a new site can skip this.
insert into public.site_settings (key, value) values
  ('shipping', '{"flatCents": 999, "countries": ["US"], "minDays": 2, "maxDays": 5}'::jsonb),
  ('business', '{"email": "you@example.com", "legalName": "Your Company LLC"}'::jsonb),
  ('palette', '{}'::jsonb),
  ('navigation', '{}'::jsonb),
  ('content', '{}'::jsonb),
  ('categories', '{}'::jsonb)
on conflict (key) do nothing;
