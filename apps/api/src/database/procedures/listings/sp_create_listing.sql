create or replace function sp_create_listing(
  p_poster_id uuid,
  p_food_type text,
  p_quantity numeric,
  p_quantity_unit text,
  p_latitude double precision,
  p_longitude double precision,
  p_address_approx text,
  p_address_exact text,
  p_prepared_at timestamptz,
  p_expires_at timestamptz
)
returns table (
  id uuid,
  poster_id uuid,
  food_type text,
  quantity numeric,
  quantity_unit text,
  latitude double precision,
  longitude double precision,
  address_approx text,
  address_exact text,
  prepared_at timestamptz,
  expires_at timestamptz,
  status text,
  created_at timestamptz
)
language plpgsql
as $$
begin
  if p_expires_at <= p_prepared_at then
    raise exception 'expires_at must be after prepared_at' using errcode = 'P0002';
  end if;

  return query
    insert into listings (
      poster_id, food_type, quantity, quantity_unit, latitude, longitude,
      address_approx, address_exact, prepared_at, expires_at
    )
    values (
      p_poster_id, p_food_type, p_quantity, p_quantity_unit, p_latitude, p_longitude,
      p_address_approx, p_address_exact, p_prepared_at, p_expires_at
    )
    returning
      listings.id, listings.poster_id, listings.food_type, listings.quantity,
      listings.quantity_unit, listings.latitude, listings.longitude,
      listings.address_approx, listings.address_exact, listings.prepared_at,
      listings.expires_at, listings.status, listings.created_at;
end;
$$;
