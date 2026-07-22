create or replace function sp_expire_listings()
returns void
language sql
as $$
  update listings
  set status = 'expired'
  where status = 'available' and expires_at < now();
$$;
