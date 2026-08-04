-- Admin dashboard aggregate: total kg/servings rescued, top donors, monthly
-- trend, waste hotspots (concept.md §6). One row of four independently
-- computed single-row/single-array CTEs, joined with a cross join — safe
-- since `totals` always produces exactly one row and the other three are
-- pre-aggregated into a single jsonb array each.
create or replace function fn_stats_overview()
returns table (
  total_kg_rescued numeric,
  total_servings_rescued numeric,
  total_completed_claims integer,
  top_donors jsonb,
  monthly_trend jsonb,
  waste_hotspots jsonb
)
language sql
stable
as $$
  with completed as (
    select l.poster_id, l.quantity, l.quantity_unit, c.completed_at
    from listings l
    join claims c on c.listing_id = l.id
    where l.status = 'completed' and c.status = 'completed'
  ),
  totals as (
    select
      coalesce(sum(quantity) filter (where quantity_unit = 'kg'), 0) as total_kg_rescued,
      coalesce(sum(quantity) filter (where quantity_unit = 'servings'), 0) as total_servings_rescued,
      count(*)::integer as total_completed_claims
    from completed
  ),
  donors as (
    select coalesce(jsonb_agg(row), '[]'::jsonb) as top_donors
    from (
      select jsonb_build_object(
        'poster_id', c.poster_id,
        'name', u.name,
        'completed_count', count(*),
        'total_kg', coalesce(sum(c.quantity) filter (where c.quantity_unit = 'kg'), 0),
        'total_servings', coalesce(sum(c.quantity) filter (where c.quantity_unit = 'servings'), 0)
      ) as row
      from completed c
      join "user" u on u.id = c.poster_id
      group by c.poster_id, u.name
      order by count(*) desc
      limit 10
    ) t
  ),
  trend as (
    select coalesce(jsonb_agg(row order by month), '[]'::jsonb) as monthly_trend
    from (
      select
        date_trunc('month', c.completed_at) as month,
        jsonb_build_object(
          'month', to_char(date_trunc('month', c.completed_at), 'YYYY-MM'),
          'completed_count', count(*),
          'total_kg', coalesce(sum(c.quantity) filter (where c.quantity_unit = 'kg'), 0),
          'total_servings', coalesce(sum(c.quantity) filter (where c.quantity_unit = 'servings'), 0)
        ) as row
      from completed c
      group by date_trunc('month', c.completed_at)
    ) t
  ),
  hotspots as (
    select coalesce(jsonb_agg(row), '[]'::jsonb) as waste_hotspots
    from (
      select jsonb_build_object(
        'address_approx', address_approx,
        'expired_count', count(*)
      ) as row
      from listings
      where status = 'expired'
      group by address_approx
      order by count(*) desc
      limit 10
    ) t
  )
  select
    totals.total_kg_rescued,
    totals.total_servings_rescued,
    totals.total_completed_claims,
    donors.top_donors,
    trend.monthly_trend,
    hotspots.waste_hotspots
  from totals, donors, trend, hotspots;
$$;
