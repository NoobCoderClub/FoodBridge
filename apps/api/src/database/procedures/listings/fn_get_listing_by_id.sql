-- Single listing, with contact details revealed only to the poster or to a
-- taker holding an active claim. The two access flags are computed once in
-- `access` and reused by both reveal rules. `active_claim_id` lets either
-- party drive a "mark completed" action straight off this response, without
-- a separate lookup — a listing has at most one active claim (enforced by
-- the M0 partial unique index), so the join can't fan out rows.
create or replace function fn_get_listing_by_id(p_id uuid, p_requester_id uuid)
returns table (
  id uuid,
  poster_id uuid,
  food_type text,
  quantity numeric,
  quantity_unit text,
  latitude double precision,
  longitude double precision,
  address_approx text,
  address_exact text,
  prepared_at timestamptz,
  expires_at timestamptz,
  status text,
  created_at timestamptz,
  poster_phone text,
  active_claim_id uuid,
  image_keys text[]
)
language sql
stable
as $$
  with access as (
    select
      l.*,
      u.phone as poster_phone,
      ac.id as active_claim_id,
      l.poster_id = p_requester_id as is_poster,
      exists (
        select 1 from claims c
        where c.listing_id = l.id
          and c.taker_id = p_requester_id
          and c.status = 'active'
      ) as has_active_claim
    from listings l
    join "user" u on u.id = l.poster_id
    left join claims ac on ac.listing_id = l.id and ac.status = 'active'
    where l.id = p_id
  )
  select
    a.id,
    a.poster_id,
    a.food_type,
    a.quantity,
    a.quantity_unit,
    a.latitude,
    a.longitude,
    a.address_approx,
    case when a.is_poster or a.has_active_claim then a.address_exact end,
    a.prepared_at,
    a.expires_at,
    a.status,
    a.created_at,
    case when a.has_active_claim and not a.is_poster then a.poster_phone end,
    case when a.is_poster or a.has_active_claim then a.active_claim_id end,
    -- Deliberately not behind the reveal rules above: the photos are what a
    -- browsing member judges the listing on before deciding to claim it, unlike
    -- the exact address and phone number, which only matter once they have.
    coalesce(
      (
        select array_agg(li.object_key order by li.position)
        from listing_images li
        where li.listing_id = a.id
      ),
      '{}'
    )
  from access a;
$$;
