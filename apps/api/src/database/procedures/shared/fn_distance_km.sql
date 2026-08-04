-- Great-circle distance in kilometres (Haversine, 6371km mean earth radius).
-- Returns null when either point is unknown, so callers can order with
-- `nulls last` instead of branching.
create or replace function fn_distance_km(
  p_lat1 double precision,
  p_lng1 double precision,
  p_lat2 double precision,
  p_lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 6371 * acos(
    -- clamp: float error can push the cosine just outside acos's domain
    least(1.0, greatest(-1.0,
      cos(radians(p_lat1)) * cos(radians(p_lat2)) * cos(radians(p_lng2) - radians(p_lng1))
      + sin(radians(p_lat1)) * sin(radians(p_lat2))
    ))
  )
  where p_lat1 is not null and p_lng1 is not null;
$$;
