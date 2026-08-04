-- Available listings, nearest first. With no caller coordinates every
-- distance is null, so the sort falls through to `expires_at` on its own —
-- no separate no-location branch needed.
create or replace function fn_browse_listings(p_lat double precision, p_lng double precision)
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
  distance_km double precision
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
    fn_distance_km(p_lat, p_lng, l.latitude, l.longitude) as distance_km
  from listings l
  where l.status = 'available'
  order by distance_km asc nulls last, l.expires_at asc;
$$;
