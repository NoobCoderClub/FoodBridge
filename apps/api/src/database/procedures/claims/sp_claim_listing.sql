-- sp_claim_listing accepts an explicit pickup deadline chosen by the taker.
-- If omitted or null, it defaults to least(now() + 60 mins, expires_at).
--
-- Self-claims are rejected outright. The partial unique index on
-- claims(listing_id) WHERE status='active' remains the race-condition backstop.
create or replace function sp_claim_listing(
  p_listing_id      uuid,
  p_taker_id        uuid,
  p_pickup_deadline timestamptz default null
)
returns table (
  id               uuid,
  listing_id       uuid,
  taker_id         uuid,
  claimed_at       timestamptz,
  pickup_deadline  timestamptz,
  status           text
)
language plpgsql
as $$
declare
  v_expires_at timestamptz;
  v_effective_deadline timestamptz;
begin
  if exists (
    select 1 from listings
    where listings.id = p_listing_id and listings.poster_id = p_taker_id
  ) then
    raise exception 'You cannot claim your own listing' using errcode = 'P0001';
  end if;

  select expires_at into v_expires_at
  from listings
  where listings.id = p_listing_id and listings.status = 'available';

  if not found then
    raise exception 'Listing % is not available to claim', p_listing_id using errcode = 'P0001';
  end if;

  -- Reject expired listings even if the cron hasn't flipped status yet.
  if now() >= v_expires_at then
    raise exception 'This listing has already expired and can no longer be claimed' using errcode = 'P0001';
  end if;

  if p_pickup_deadline is not null then
    if p_pickup_deadline > v_expires_at then
      raise exception 'Collection time cannot be after listing expiry' using errcode = 'P0001';
    end if;
    v_effective_deadline := p_pickup_deadline;
  else
    v_effective_deadline := least(now() + interval '60 minutes', v_expires_at);
  end if;

  return query
    with claimed as (
      update listings
      set status = 'claimed'
      where listings.id = p_listing_id and listings.status = 'available'
      returning listings.id
    )
    insert into claims (listing_id, taker_id, pickup_deadline)
    select claimed.id, p_taker_id, v_effective_deadline
    from claimed
    returning claims.id, claims.listing_id, claims.taker_id, claims.claimed_at,
      claims.pickup_deadline, claims.status;

  if not found then
    raise exception 'Listing % is not available to claim', p_listing_id using errcode = 'P0001';
  end if;
end;
$$;
