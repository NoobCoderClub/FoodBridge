-- Times out claims past their pickup deadline and reopens the listings behind
-- them. The claims/listings update is still one atomic CTE, unchanged from
-- before: it marks the stale claims and hands their listing ids straight to
-- the UPDATE, so `claims` is scanned once rather than twice. The only
-- addition is fanning out a reputation no-show penalty to each affected
-- taker, which needs plpgsql for the loop.
create or replace function sp_release_stale_claims()
returns void
language plpgsql
as $$
declare
  v_taker_id uuid;
begin
  for v_taker_id in
    with stale as (
      update claims
      set status = 'no_show'
      where status = 'active' and pickup_deadline < now()
      returning listing_id, taker_id
    ),
    reopened as (
      update listings
      set status = 'available'
      where status = 'claimed' and id in (select listing_id from stale)
    )
    select taker_id from stale
  loop
    perform sp_recompute_reputation(v_taker_id, 0, 1);
  end loop;
end;
$$;
