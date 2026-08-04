-- Marks a claim and its listing completed, then credits both parties'
-- reputation. Authorization lives here rather than the API layer: only the
-- taker or the listing's poster may complete a claim they're party to,
-- enforced by folding both the actor and status checks into the UPDATE's own
-- WHERE (same race-free idiom as sp_approve_account/sp_claim_listing) so two
-- simultaneous completion attempts can't both succeed.
create or replace function sp_complete_claim(p_claim_id uuid, p_actor_id uuid)
returns table (
  id uuid,
  listing_id uuid,
  taker_id uuid,
  claimed_at timestamptz,
  pickup_deadline timestamptz,
  status text,
  completed_at timestamptz
)
language plpgsql
as $$
declare
  v_claim record;
begin
  with completed as (
    update claims c
    set status = 'completed', completed_at = now()
    from listings l
    where c.id = p_claim_id
      and c.listing_id = l.id
      and c.status = 'active'
      and p_actor_id in (c.taker_id, l.poster_id)
    returning c.id, c.listing_id, c.taker_id, c.claimed_at, c.pickup_deadline,
      c.status, c.completed_at
  )
  select c.id, c.listing_id, c.taker_id, c.claimed_at, c.pickup_deadline,
    c.status, c.completed_at, l.poster_id
  into v_claim
  from completed c
  join listings l on l.id = c.listing_id;

  if v_claim.id is null then
    raise exception 'Claim % is not an active claim you can complete', p_claim_id using errcode = 'P0001';
  end if;

  update listings set status = 'completed' where listings.id = v_claim.listing_id;

  perform sp_recompute_reputation(v_claim.taker_id, 1, 0);
  perform sp_recompute_reputation(v_claim.poster_id, 1, 0);

  return query
    select v_claim.id, v_claim.listing_id, v_claim.taker_id, v_claim.claimed_at,
      v_claim.pickup_deadline, v_claim.status, v_claim.completed_at;
end;
$$;
