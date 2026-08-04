-- See sp_approve_account for why the status check sits in the UPDATE's WHERE.
create or replace function sp_suspend_account(p_id uuid)
returns table (
  id uuid,
  name text,
  email text,
  role text,
  status text
)
language plpgsql
as $$
begin
  return query
    update "user"
    set status = 'suspended', "updatedAt" = now()
    where "user".id = p_id and "user".status = 'approved'
    returning "user".id, "user".name, "user".email, "user".role, "user".status;

  if not found then
    raise exception 'Account % is not an approved account', p_id using errcode = 'P0001';
  end if;
end;
$$;
