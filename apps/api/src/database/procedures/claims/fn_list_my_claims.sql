create or replace function fn_list_my_claims(p_taker_id uuid)
returns table (
  id uuid,
  listing_id uuid,
  claimed_at timestamptz,
  pickup_deadline timestamptz,
  status text,
  food_type text,
  address_approx text
)
language sql
stable
as $$
  select
    c.id,
    c.listing_id,
    c.claimed_at,
    c.pickup_deadline,
    c.status,
    l.food_type,
    l.address_approx
  from claims c
  join listings l on l.id = c.listing_id
  where c.taker_id = p_taker_id
  order by c.claimed_at desc;
$$;
