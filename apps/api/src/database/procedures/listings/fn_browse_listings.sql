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
    case
      when p_lat is null or p_lng is null then null
      else 6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(p_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(l.latitude))
        ))
      )
    end as distance_km
  from listings l
  where l.status = 'available'
  order by
    case when p_lat is null or p_lng is null then l.expires_at end asc nulls last,
    distance_km asc nulls last,
    l.expires_at asc;
$$;
