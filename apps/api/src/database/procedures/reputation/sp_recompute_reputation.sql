-- Adds the given deltas to a user's reputation counters and recomputes
-- `score` in one statement. Called from other procedures (sp_complete_claim,
-- sp_release_stale_claims), never from the API layer directly.
--
-- The insert's own values double as the upsert delta: ON CONFLICT reads them
-- back via `excluded` and adds them to the existing row, so the same
-- statement handles both "first reputation event for this user" and
-- "another one on top of an existing row".
create or replace function sp_recompute_reputation(
  p_user_id uuid,
  p_completed_delta integer default 0,
  p_no_show_delta integer default 0
)
returns void
language sql
as $$
  with upserted as (
    insert into reputation (user_id, completed_count, no_show_count, score, updated_at)
    values (
      p_user_id,
      greatest(p_completed_delta, 0),
      greatest(p_no_show_delta, 0),
      0,
      now()
    )
    on conflict (user_id) do update
    set completed_count = reputation.completed_count + excluded.completed_count,
        no_show_count = reputation.no_show_count + excluded.no_show_count,
        updated_at = now()
    returning user_id, completed_count, no_show_count
  )
  update reputation r
  set score = u.completed_count::numeric / greatest(u.completed_count + u.no_show_count, 1)
  from upserted u
  where r.user_id = u.user_id;
$$;
