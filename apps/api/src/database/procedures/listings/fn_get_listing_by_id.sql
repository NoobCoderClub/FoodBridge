create or replace function fn_get_listing_by_id(p_id uuid, p_requester_id uuid)
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
  poster_phone text
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
    l.latitude,
    l.longitude,
    l.address_approx,
    case
      when l.poster_id = p_requester_id then l.address_exact
      when exists (
        select 1 from claims c
        where c.listing_id = l.id and c.taker_id = p_requester_id and c.status = 'active'
      ) then l.address_exact
      else null
    end as address_exact,
    l.prepared_at,
    l.expires_at,
    l.status,
    l.created_at,
    case
      when l.poster_id = p_requester_id then null
      when exists (
        select 1 from claims c
        where c.listing_id = l.id and c.taker_id = p_requester_id and c.status = 'active'
      ) then u.phone
      else null
    end as poster_phone
  from listings l
  join "user" u on u.id = l.poster_id
  where l.id = p_id;
$$;
