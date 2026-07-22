create or replace function fn_list_accounts(p_status text)
returns table (
  id uuid,
  name text,
  email text,
  role text,
  status text,
  phone text,
  verification_info jsonb,
  created_at timestamptz
)
language sql
stable
as $$
  select u.id, u.name, u.email, u.role, u.status, u.phone, u."verificationInfo", u."createdAt"
  from "user" u
  where p_status is null or u.status = p_status
  order by u."createdAt" asc;
$$;
