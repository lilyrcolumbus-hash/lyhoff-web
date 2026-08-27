-- Products need an explicit order: the shop page and the home page's featured
-- strip are merchandising decisions (best-seller first), not an alphabetical
-- list. Without this the catalogue re-sorted itself by slug the moment it moved
-- out of the hand-written array.
alter table public.products
  add column if not exists position integer;

update public.products as p
set position = v.pos
from (values
  ('tallow-cream-2oz', 1),
  ('tallow-cream-2oz-peppermint', 2),
  ('tallow-cream-2oz-vanilla', 3),
  ('tallow-cream-1oz', 4),
  ('tallow-cream-1oz-peppermint', 5),
  ('tallow-cream-1oz-vanilla', 6),
  ('comfrey-salve-2oz', 7),
  ('comfrey-salve-2oz-peppermint', 8),
  ('comfrey-salve-2oz-vanilla', 9),
  ('comfrey-salve-1oz', 10),
  ('comfrey-salve-1oz-peppermint', 11),
  ('comfrey-salve-1oz-vanilla', 12),
  ('hair-growth-oil', 13),
  ('sea-salt-spray-her', 14),
  ('sea-salt-spray-him', 15),
  ('hummingbird-nectar', 16),
  ('methylene-blue', 17)
) as v(slug, pos)
where p.slug = v.slug;

-- Anything added later goes to the end rather than to the top.
alter table public.products
  alter column position set default 999;
update public.products set position = 999 where position is null;
create index if not exists products_position_idx on public.products (position);
