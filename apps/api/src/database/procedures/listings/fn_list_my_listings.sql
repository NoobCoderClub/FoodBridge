-- A poster's own listings, newest first, across every status.
--
-- Distinct from `fn_browse_listings`, which is taker-facing and hides anything
-- that isn't currently available. A poster needs to see the whole history —
-- including what expired uncollected — so the result is unfiltered by status
-- and carries the active claim id so the UI can offer "mark collected".
create or replace function fn_list_my_listings(p_poster_id uuid)
returns table (
  id uuid,
  poster_id uuid,
  food_type text,
  quantity numeric,
  quantity_unit text,
  address_approx text,
  prepared_at timestamptz,
  expires_at timestamptz,
  status text,
  created_at timestamptz,
  active_claim_id uuid,
  thumbnail_key text
)
language sql
stable
as $$
  select
    l.id,
    l.poster_id,
    l.food_type,
    l.quantity,
    l.quantity_unit,
    l.address_approx,
    l.prepared_at,
    l.expires_at,
    l.status,
    l.created_at,
    (
      select c.id
      from claims c
      where c.listing_id = l.id and c.status = 'active'
      limit 1
    ) as active_claim_id,
    -- Cover image only, matching `fn_browse_listings` — both feed cards.
    (
      select li.object_key
      from listing_images li
      where li.listing_id = l.id
      order by li.position
      limit 1
    ) as thumbnail_key
  from listings l
  where l.poster_id = p_poster_id
  order by l.created_at desc;
$$;
