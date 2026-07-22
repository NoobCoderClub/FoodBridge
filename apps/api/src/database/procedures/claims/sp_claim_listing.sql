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
declare
  v_listing_id uuid;
begin
  -- Row lock is the primary defense against a double-claim race; the partial
  -- unique index on claims(listing_id) WHERE status='active' is the backstop
  -- (its 23505 violation is mapped to a friendly 409 by the global exception filter).
  select listings.id into v_listing_id
  from listings
  where listings.id = p_listing_id and listings.status = 'available'
  for update;

  if v_listing_id is null then
    raise exception 'Listing % is not available to claim', p_listing_id using errcode = 'P0001';
  end if;

  update listings set status = 'claimed' where listings.id = v_listing_id;

  return query
    insert into claims (listing_id, taker_id, pickup_deadline)
    values (v_listing_id, p_taker_id, now() + interval '60 minutes')
    returning claims.id, claims.listing_id, claims.taker_id, claims.claimed_at,
      claims.pickup_deadline, claims.status;
end;
$$;
