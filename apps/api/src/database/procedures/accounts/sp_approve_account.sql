-- The `pending` check lives in the UPDATE's own WHERE rather than a preceding
-- EXISTS: one scan instead of two, and two concurrent approvals can't both pass
-- a check before either writes. `RETURN QUERY` sets FOUND, and raising rolls the
-- update back.
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
  return query
    update "user"
    set status = 'approved', "updatedAt" = now()
    where "user".id = p_id and "user".status = 'pending'
    returning "user".id, "user".name, "user".email, "user".role, "user".status;

  if not found then
    raise exception 'Account % is not pending approval', p_id using errcode = 'P0001';
  end if;
end;
$$;
