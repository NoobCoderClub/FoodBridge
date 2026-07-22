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
  if not exists (select 1 from "user" where "user".id = p_id and "user".status = 'approved') then
    raise exception 'Account % is not an approved account', p_id using errcode = 'P0001';
  end if;

  return query
    update "user"
    set status = 'suspended', "updatedAt" = now()
    where "user".id = p_id
    returning "user".id, "user".name, "user".email, "user".role, "user".status;
end;
$$;
