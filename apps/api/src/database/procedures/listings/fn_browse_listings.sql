-- Available listings, nearest first. With no caller coordinates every
-- distance is null, so the sort falls through to `expires_at` on its own —
-- no separate no-location branch needed.
--
-- The viewer's own listings are excluded: one profile both posts and claims, so
-- without this your own surplus would sit in the feed you use to find food.
-- `is distinct from` rather than `<>` so a null viewer id still returns everything.
create or replace function fn_browse_listings(
  p_lat double precision,
  p_lng double precision,
  p_viewer_id uuid
)
returns table (
  id uuid,
  poster_id uuid,
  food_type text,
  quantity numeric,
  quantity_unit text,
  address_approx text,
  prepared_at timestamptz,
  expires_at timestamptz,
  status text,
  created_at timestamptz,
  distance_km double precision,
  thumbnail_key text
)
language sql
stable
as $$
  select
    l.id,
    l.poster_id,
    l.food_type,
    l.quantity,
    l.quantity_unit,
    l.address_approx,
    l.prepared_at,
    l.expires_at,
    l.status,
    l.created_at,
    fn_distance_km(p_lat, p_lng, l.latitude, l.longitude) as distance_km,
    -- Only the cover: a card shows one photo, and each key costs the API a
    -- presigned URL, so pulling the whole gallery here would be N times the work
    -- for something the grid never renders.
    (
      select li.object_key
      from listing_images li
      where li.listing_id = l.id
      order by li.position
      limit 1
    ) as thumbnail_key
  from listings l
  where l.status = 'available'
    and l.poster_id is distinct from p_viewer_id
  order by distance_km asc nulls last, l.expires_at asc;
$$;
