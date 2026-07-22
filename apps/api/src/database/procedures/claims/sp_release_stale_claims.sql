create or replace function sp_release_stale_claims()
returns void
language plpgsql
as $$
begin
  update listings
  set status = 'available'
  where status = 'claimed'
    and id in (
      select listing_id from claims
      where status = 'active' and pickup_deadline < now()
    );

  update claims
  set status = 'no_show'
  where status = 'active' and pickup_deadline < now();
end;
$$;
