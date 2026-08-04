-- Times out claims past their pickup deadline and reopens the listings behind
-- them. One statement: the CTE marks the stale claims and hands their listing
-- ids straight to the UPDATE, so `claims` is scanned once rather than twice.
create or replace function sp_release_stale_claims()
returns void
language sql
as $$
  with stale as (
    update claims
    set status = 'no_show'
    where status = 'active' and pickup_deadline < now()
    returning listing_id
  )
  update listings
  set status = 'available'
  where status = 'claimed' and id in (select listing_id from stale);
$$;
