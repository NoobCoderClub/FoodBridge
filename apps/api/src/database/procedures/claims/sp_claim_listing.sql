-- Claiming a listing is one atomic statement: the UPDATE takes the row lock
-- itself, and under READ COMMITTED a losing concurrent transaction re-evaluates
-- its WHERE once the lock clears, matches nothing, and feeds the INSERT no rows.
-- That makes the separate SELECT ... FOR UPDATE redundant.
--
-- The partial unique index on claims(listing_id) WHERE status='active' remains
-- the backstop; its 23505 is mapped to a 409 by the global exception filter.
create or replace function sp_claim_listing(p_listing_id uuid, p_taker_id uuid)
returns table (
  id uuid,
  listing_id uuid,
  taker_id uuid,
  claimed_at timestamptz,
  pickup_deadline timestamptz,
  status text
)
language plpgsql
as $$
begin
  return query
    with claimed as (
      update listings
      set status = 'claimed'
      where listings.id = p_listing_id and listings.status = 'available'
      returning listings.id
    )
    insert into claims (listing_id, taker_id, pickup_deadline)
    select claimed.id, p_taker_id, now() + interval '60 minutes'
    from claimed
    returning claims.id, claims.listing_id, claims.taker_id, claims.claimed_at,
      claims.pickup_deadline, claims.status;

  if not found then
    raise exception 'Listing % is not available to claim', p_listing_id using errcode = 'P0001';
  end if;
end;
$$;
