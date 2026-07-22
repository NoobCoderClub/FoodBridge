create or replace function sp_approve_account(p_id uuid)
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
  if not exists (select 1 from "user" where "user".id = p_id and "user".status = 'pending') then
    raise exception 'Account % is not pending approval', p_id using errcode = 'P0001';
  end if;

  return query
    update "user"
    set status = 'approved', "updatedAt" = now()
    where "user".id = p_id
    returning "user".id, "user".name, "user".email, "user".role, "user".status;
end;
$$;
