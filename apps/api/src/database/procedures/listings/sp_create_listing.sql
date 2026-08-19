-- Creates a listing and its gallery in one call, so a listing can never be
-- committed without the photos the poster attached to it.
--
-- The row is captured into `v_listing` rather than streamed straight out of the
-- insert, because the generated id is needed a second time to hang the
-- `listing_images` rows off. `with ordinality` carries the caller's array order
-- through as `position`, making position 0 the cover image.
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
  p_expires_at timestamptz,
  p_image_keys text[]
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
  created_at timestamptz,
  image_keys text[]
)
language plpgsql
as $$
declare
  v_listing listings;
  v_keys text[] := coalesce(p_image_keys, '{}');
begin
  if p_expires_at <= p_prepared_at then
    raise exception 'expires_at must be after prepared_at' using errcode = 'P0002';
  end if;

  insert into listings (
    poster_id, food_type, quantity, quantity_unit, latitude, longitude,
    address_approx, address_exact, prepared_at, expires_at
  )
  values (
    p_poster_id, p_food_type, p_quantity, p_quantity_unit, p_latitude, p_longitude,
    p_address_approx, p_address_exact, p_prepared_at, p_expires_at
  )
  returning * into v_listing;

  insert into listing_images (listing_id, object_key, position)
  select v_listing.id, t.key, t.ord - 1
  from unnest(v_keys) with ordinality as t(key, ord);

  return query
    select
      v_listing.id, v_listing.poster_id, v_listing.food_type, v_listing.quantity,
      v_listing.quantity_unit, v_listing.latitude, v_listing.longitude,
      v_listing.address_approx, v_listing.address_exact, v_listing.prepared_at,
      v_listing.expires_at, v_listing.status, v_listing.created_at, v_keys;
end;
$$;
